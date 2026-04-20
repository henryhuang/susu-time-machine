import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdmin } from "@/server/auth";

export async function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <AdminShell username={admin.username}>{children}</AdminShell>;
}
