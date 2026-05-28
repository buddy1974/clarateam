import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    userId:     session.userId,
    userName:   session.userName,
    userRole:   session.userRole,
    userHandle: session.userHandle,
  });
}
