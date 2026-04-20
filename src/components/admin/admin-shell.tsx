import Link from "next/link";
import { LayoutDashboard, LogOut, Plus, Upload, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminShell({ children, username }: { children: React.ReactNode; username: string }) {
  return (
    <div className="grid min-h-screen bg-susu-bg lg:grid-cols-[232px_1fr]">
      <aside className="hidden border-r border-susu-line bg-gradient-to-b from-white to-peach-50 px-4 py-6 lg:block">
        <Link href="/admin" className="flex items-center gap-3 px-2 pb-7">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-peach-500 font-bold text-white shadow-soft">酥</span>
          <span>
            <span className="block font-bold">酥酥时光机后台</span>
            <span className="text-xs text-susu-muted">成长故事工作台</span>
          </span>
        </Link>
        <nav className="grid gap-2">
          <AdminNavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="仪表盘" />
          <AdminNavLink href="/admin/stories" icon={<Rows3 className="h-4 w-4" />} label="故事管理" />
          <AdminNavLink href="/admin/stories/new" icon={<Plus className="h-4 w-4" />} label="新增故事" />
          <AdminNavLink href="/admin/stories/new#images" icon={<Upload className="h-4 w-4" />} label="上传图片" />
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-susu-line bg-susu-bg/90 px-4 backdrop-blur sm:px-8">
          <div className="text-sm text-susu-muted">
            酥酥时光机 / <strong className="text-susu-text">控制台</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{username}</span>
            <form action="/api/auth/logout" method="post">
              <Button variant="ghost" size="sm" className="text-susu-muted hover:text-peach-600">
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </form>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-susu-muted transition hover:bg-peach-100 hover:text-susu-text">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-peach-600">{icon}</span>
      {label}
    </Link>
  );
}
