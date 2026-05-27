import { NextRequest, NextResponse } from "next/server";
import { db, invoices, invoiceLines, clients } from "@/db";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invId = parseInt(id);

  const [invRow] = await db
    .select({
      id:         invoices.id,
      clientId:   invoices.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      clientAddress: clients.address,
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
    .where(eq(invoices.id, invId));

  if (!invRow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lines = await db
    .select()
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, invId))
    .orderBy(invoiceLines.id);

  return NextResponse.json({ ...invRow, lines });
}
