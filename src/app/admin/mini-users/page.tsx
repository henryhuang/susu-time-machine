import Link from "next/link";
import { ProtectedAdmin } from "@/components/admin/protected-admin";
import { MiniUserManager } from "@/components/admin/mini-user-manager";
import { ButtonLink } from "@/components/ui/button";
import { listMiniProgramUsers } from "@/server/mini-users";

export const dynamic = "force-dynamic";

export default async function AdminMiniUsersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; allowed?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const allowed = params.allowed === "true" ? true : params.allowed === "false" ? false : undefined;
  const users = await listMiniProgramUsers({ page, pageSize: 20, query: params.q, allowed });

  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    query.set("page", String(nextPage));
    if (params.q) query.set("q", params.q);
    if (params.allowed) query.set("allowed", params.allowed);
    return `/admin/mini-users?${query.toString()}`;
  };

  return (
    <ProtectedAdmin>
      <div className="grid gap-5">
        <div>
          <p className="font-semibold text-peach-600">小程序权限</p>
          <h1 className="mt-2 text-2xl font-extrabold">管理允许访问小程序的用户</h1>
          <p className="mt-2 text-susu-muted">小程序通过公开权限检查接口上报 openId 或 unionId，后台在这里打开访问开关。</p>
        </div>

        <form className="flex flex-wrap gap-3 rounded-lg border border-susu-line bg-white p-4 shadow-soft">
          <input
            name="q"
            defaultValue={params.q || ""}
            placeholder="搜索 openid、昵称、备注"
            className="h-10 min-w-64 rounded-lg border border-susu-line px-3 text-sm outline-none focus:border-peach-500"
          />
          <select name="allowed" defaultValue={params.allowed || ""} className="h-10 rounded-lg border border-susu-line bg-white px-3 text-sm outline-none focus:border-peach-500">
            <option value="">全部状态</option>
            <option value="true">已允许</option>
            <option value="false">未允许</option>
          </select>
          <button className="h-10 rounded-lg bg-peach-500 px-4 text-sm font-semibold text-white">筛选</button>
          <Link href="/admin/mini-users" className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-peach-600">
            清空
          </Link>
        </form>

        <MiniUserManager users={users.items} />

        <div className="flex justify-center gap-3">
          {page > 1 ? <ButtonLink href={pageHref(page - 1)}>上一页</ButtonLink> : null}
          {users.hasMore ? (
            <ButtonLink href={pageHref(page + 1)} variant="primary">
              下一页
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </ProtectedAdmin>
  );
}
