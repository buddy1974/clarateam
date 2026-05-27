import { NextRequest, NextResponse } from "next/server";
import { db, invoices, invoiceLines, shifts, staff, clients } from "@/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { notify } from "@/lib/telegram";

// ── GET — list invoices with optional status filter ─────────────────────────

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status   = searchParams.get("status");
  const clientId = searchParams.get("clientId");

  let query = db
    .select({
      id:         invoices.id,
      clientId:   invoices.clientId,
      clientName: clients.name,
      invoiceNo:  invoices.invoiceNo,
      periodFrom: invoices.periodFrom,
      periodTo:   invoices.periodTo,
      status:     invoices.status,
      subtotal:   invoices.subtotal,
      taxRate:    invoices.taxRate,
      taxAmount:  invoices.taxAmount,
      total:      invoices.total,
      dueDate:    invoices.dueDate,
      paidAt:     invoices.paidAt,
      notes:      invoices.notes,
      createdAt:  invoices.createdAt,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(invoices.createdAt));

  const conditions = [];
  if (status)   conditions.push(eq(invoices.status, status as "draft" | "sent" | "paid" | "overdue" | "cancelled"));
  if (clientId) conditions.push(eq(invoices.clientId, parseInt(clientId)));

  const rows = conditions.length ? await query.where(and(...conditions)) : await query;
  return NextResponse.json(rows);
}

// ── POST — create invoice, auto-pulling completed shifts ────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, periodFrom, periodTo, taxRate = 0, dueDate, notes } = await req.json();

  // 1. Find all completed shifts for this client in the period
  const shiftRows = await db
    .select({
      shiftId:    shifts.id,
      shiftDate:  shifts.shiftDate,
      hours:      shifts.hours,
      staffId:    staff.id,
      staffName:  staff.name,
      hourlyRate: staff.hourlyRate,
    })
    .from(shifts)
    .leftJoin(staff, eq(shifts.staffId, staff.id))
    .where(and(
      eq(shifts.clientId, clientId),
      gte(shifts.shiftDate, periodFrom),
      lte(shifts.shiftDate, periodTo),
      eq(shifts.status, "completed"),
    ));

  // 2. Group by staff member
  const grouped = new Map<number, {
    staffId: number; staffName: string; hourlyRate: string | null;
    totalHours: number; shiftIds: number[];
  }>();

  for (const row of shiftRows) {
    if (!row.staffId) continue;
    const prev = grouped.get(row.staffId);
    const hrs  = parseFloat(row.hours ?? "0");
    if (prev) {
      prev.totalHours += hrs;
      prev.shiftIds.push(row.shiftId);
    } else {
      grouped.set(row.staffId, {
        staffId:    row.staffId,
        staffName:  row.staffName ?? "Unknown",
        hourlyRate: row.hourlyRate,
        totalHours: hrs,
        shiftIds:   [row.shiftId],
      });
    }
  }

  // 3. Build line items
  const lineItems: { staffName: string; description: string; hours: number; rate: number; amount: number }[] = [];
  for (const g of grouped.values()) {
    const rate   = parseFloat(g.hourlyRate ?? "18");
    const amount = parseFloat((g.totalHours * rate).toFixed(2));
    lineItems.push({
      staffName:   g.staffName,
      description: `Caregiving services — ${periodFrom} to ${periodTo}`,
      hours:       parseFloat(g.totalHours.toFixed(2)),
      rate,
      amount,
    });
  }

  // 4. Totals
  const subtotal  = lineItems.reduce((s, l) => s + l.amount, 0);
  const taxAmt    = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
  const total     = parseFloat((subtotal + taxAmt).toFixed(2));

  // 5. Invoice number (INV-YYYY-NNN)
  const year = new Date().getFullYear();
  const last = await db.select({ invoiceNo: invoices.invoiceNo })
    .from(invoices).orderBy(desc(invoices.id)).limit(1);
  let seq = 1;
  if (last.length > 0) {
    const parts = last[0].invoiceNo.split("-");
    const n = parseInt(parts[parts.length - 1]);
    if (!isNaN(n)) seq = n + 1;
  }
  const invoiceNo = `INV-${year}-${seq.toString().padStart(3, "0")}`;

  // 6. Insert invoice
  const [inv] = await db.insert(invoices).values({
    clientId,
    invoiceNo,
    periodFrom,
    periodTo,
    taxRate:   String(taxRate),
    taxAmount: String(taxAmt),
    subtotal:  String(subtotal),
    total:     String(total),
    dueDate:   dueDate ?? null,
    notes:     notes ?? null,
  }).returning();

  // 7. Insert lines
  if (lineItems.length > 0) {
    await db.insert(invoiceLines).values(
      lineItems.map((li) => ({
        invoiceId:   inv.id,
        shiftId:     null,
        staffName:   li.staffName,
        description: li.description,
        hours:       String(li.hours),
        rate:        String(li.rate),
        amount:      String(li.amount),
      }))
    );
  }

  // Fire-and-forget Telegram notification
  const clientRow = await db.select({ name: clients.name }).from(clients)
    .where(eq(clients.id, clientId)).then((r) => r[0]);
  notify.invoiceGenerated(
    clientRow?.name ?? `Client #${clientId}`,
    invoiceNo,
    total.toFixed(2),
  ).catch(console.error);

  return NextResponse.json({ ...inv, lineCount: lineItems.length }, { status: 201 });
}

// ── PATCH — update invoice status / fields ──────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, paidAt, notes, dueDate } = await req.json();

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (status)  patch.status  = status;
  if (paidAt)  patch.paidAt  = paidAt;
  if (notes  !== undefined) patch.notes   = notes;
  if (dueDate !== undefined) patch.dueDate = dueDate;

  const [updated] = await db
    .update(invoices)
    .set(patch)
    .where(eq(invoices.id, id))
    .returning();

  // Telegram: fire when invoice marked paid
  if (status === "paid" && updated) {
    const clientRow = await db.select({ name: clients.name }).from(clients)
      .where(eq(clients.id, updated.clientId)).then((r) => r[0]);
    notify.invoicePaid(
      clientRow?.name ?? `Client #${updated.clientId}`,
      updated.invoiceNo,
      updated.total,
    ).catch(console.error);
  }

  return NextResponse.json(updated);
}
