import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdmin } from "@/server/auth";
import { getChildProfile } from "@/lib/child-profile";

export async function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const [admin, child] = await Promise.all([getCurrentAdmin(), getChildProfile()]);
  if (!admin) redirect("/admin/login");
  return <AdminShell username={admin.username} displayName={child.displayName}>{children}</AdminShell>;
}
