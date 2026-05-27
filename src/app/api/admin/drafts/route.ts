import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drafts, auditLogs, careRecipients, carePlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { draftNotify } from "@/lib/notifications/telegram";

// ── GET: list all drafts (optional ?status= filter) ───────────────────────

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as
    | "draft" | "pending" | "approved" | "rejected" | null;

  const rows = status
    ? await db.select().from(drafts)
        .where(eq(drafts.status, status))
        .orderBy(desc(drafts.createdAt))
    : await db.select().from(drafts).orderBy(desc(drafts.createdAt));

  return NextResponse.json(rows);
}

// ── POST: create new draft ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    type?:            string;
    rawData?:         unknown;
    aiData?:          unknown;
    relatedEntityId?: number;
    createdBy?:       string;
    urgent?:          boolean;
  };

  const {
    type       = "intake",
    rawData,
    aiData,
    relatedEntityId,
    createdBy  = "admin",
    urgent     = false,
  } = body;

  const [draft] = await db.insert(drafts).values({
    type: type as "intake" | "medication" | "report" | "care_plan" | "incident" | "shift_note",
    rawData: typeof rawData === "string" ? rawData : JSON.stringify(rawData ?? {}),
    aiData:  typeof aiData  === "string" ? aiData  : JSON.stringify(aiData  ?? {}),
    relatedEntityId: relatedEntityId ?? null,
    createdBy,
    status: "draft",
  }).returning();

  // Audit
  await db.insert(auditLogs).values({
    entityType:  "draft",
    entityId:    draft.id,
    action:      "create",
    performedBy: createdBy,
  });

  // Telegram (fire-and-forget)
  void draftNotify.created(draft.id, type);

  if (urgent) {
    const parsed = typeof aiData === "string"
      ? JSON.parse(aiData) as Record<string, string>
      : (aiData as Record<string, string> | undefined) ?? {};
    void draftNotify.urgentIntake(parsed?.name ?? "Unknown", type);
  }

  return NextResponse.json(draft, { status: 201 });
}

// ── PATCH: update draft (pending / approve / reject / edit / edit_approve) ─

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    id:            number;
    action:        "pending" | "approve" | "reject" | "edit" | "edit_approve";
    aiData?:       unknown;
    rawData?:      unknown;
    performedBy?:  string;
    rejectReason?: string;
  };

  const { id, action, aiData, rawData, performedBy = "admin", rejectReason } = body;

  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  // Fetch current state
  const [current] = await db.select().from(drafts).where(eq(drafts.id, id));
  if (!current) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  let newStatus = current.status;
  let careRecipientId: number | null = null;

  // ── Pending ──────────────────────────────────────────────────────────
  if (action === "pending") {
    newStatus = "pending";
    const parsed = current.aiData ? JSON.parse(current.aiData) as Record<string, string> : {};
    void draftNotify.pending(id, parsed?.name ?? parsed?.firstName ?? "Unknown");
  }

  // ── Approve ───────────────────────────────────────────────────────────
  if (action === "approve" || action === "edit_approve") {
    newStatus = "approved";

    if (current.type === "intake") {
      const ai  = current.aiData  ? JSON.parse(current.aiData)  as Record<string, string> : {};
      const raw = current.rawData ? JSON.parse(current.rawData) as Record<string, string> : {};

      // Merge: ai data wins over raw data
      const merged: Record<string, string> = { ...raw, ...ai };

      // Override with any freshly-edited aiData from request body
      if (aiData) {
        const fresh = typeof aiData === "string"
          ? JSON.parse(aiData) as Record<string, string>
          : aiData as Record<string, string>;
        Object.assign(merged, fresh);
      }

      const fullName = (
        merged.name ??
        `${merged.firstName ?? ""} ${merged.lastName ?? ""}`.trim()
      ) || "Unknown";

      // 1. Create care_plan (blank template linked after)
      const [plan] = await db.insert(carePlans).values({
        notes: merged.careNeeds ?? merged.notes ?? null,
      }).returning();

      // 2. Create care_recipient
      const [recipient] = await db.insert(careRecipients).values({
        name:                 fullName,
        firstName:            merged.firstName ?? null,
        lastName:             merged.lastName  ?? null,
        gender:               merged.gender    ?? null,
        dateOfBirth:          merged.dateOfBirth ?? null,
        address:              merged.address   ?? null,
        emergencyContactName: merged.emergencyContact ?? null,
        careNeeds:            merged.careNeeds ?? null,
        notes:                merged.notes     ?? null,
        carePlanId:           plan.id,
        status:               "active",
        active:               true,
      }).returning();

      careRecipientId = recipient.id;

      // 3. Back-link plan → recipient
      await db.update(carePlans)
        .set({ careRecipientId: recipient.id, updatedAt: new Date() })
        .where(eq(carePlans.id, plan.id));

      // 4. Link draft → entity
      await db.update(drafts)
        .set({ relatedEntityId: recipient.id })
        .where(eq(drafts.id, id));

      void draftNotify.approved(id, fullName);
    }
  }

  // ── Reject ────────────────────────────────────────────────────────────
  if (action === "reject") {
    newStatus = "rejected";
    void draftNotify.rejected(id, rejectReason);
  }

  // ── Build update payload ──────────────────────────────────────────────
  const patch: Record<string, unknown> = {
    status:    newStatus,
    updatedAt: new Date(),
  };

  if (aiData  !== undefined) patch.aiData  = typeof aiData  === "string" ? aiData  : JSON.stringify(aiData);
  if (rawData !== undefined) patch.rawData = typeof rawData === "string" ? rawData : JSON.stringify(rawData);

  if (action === "edit" || action === "edit_approve") {
    patch.version = current.version + 1;
  }

  const [updated] = await db.update(drafts)
    .set(patch)
    .where(eq(drafts.id, id))
    .returning();

  // Audit log
  await db.insert(auditLogs).values({
    entityType:  "draft",
    entityId:    id,
    action,
    performedBy,
    meta: careRecipientId
      ? JSON.stringify({ careRecipientId, action })
      : JSON.stringify({ action }),
  });

  return NextResponse.json(updated);
}
