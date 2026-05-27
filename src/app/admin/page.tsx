import { redirect } from "next/navigation";

// Middleware handles auth — this just redirects to the dashboard
export const dynamic = "force-dynamic";

export default function AdminPage() {
  redirect("/admin/dashboard");
}
