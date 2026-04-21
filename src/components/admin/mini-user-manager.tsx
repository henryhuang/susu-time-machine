"use client";

import { Check, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

type MiniProgramUser = {
  id: string;
  openId: string | null;
  unionId: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  remark: string | null;
  allowed: boolean;
  source: string;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  openId: string;
  unionId: string;
  nickname: string;
  avatarUrl: string;
  phone: string;
  remark: string;
  allowed: boolean;
};

const emptyForm: FormState = {
  openId: "",
  unionId: "",
  nickname: "",
  avatarUrl: "",
  phone: "",
  remark: "",
  allowed: true
};

export function MiniUserManager({ users }: { users: MiniProgramUser[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  function toPayload(value: FormState) {
    return {
      openId: value.openId,
      unionId: value.unionId,
      nickname: value.nickname,
      avatarUrl: value.avatarUrl,
      phone: value.phone,
      remark: value.remark,
      allowed: value.allowed
    };
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    const response = await fetch("/api/admin/mini-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form))
    });
    setCreating(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data.message || "新增失败");
      return;
    }
    setForm(emptyForm);
    router.refresh();
  }

  function startEdit(user: MiniProgramUser) {
    setEditingId(user.id);
    setEditForm({
      openId: user.openId || "",
      unionId: user.unionId || "",
      nickname: user.nickname || "",
      avatarUrl: user.avatarUrl || "",
      phone: user.phone || "",
      remark: user.remark || "",
      allowed: user.allowed
    });
  }

  async function updateUser(id: string, value: FormState) {
    setBusyId(id);
    const response = await fetch(`/api/admin/mini-users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(value))
    });
    setBusyId(null);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data.message || "保存失败");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function removeUser(user: MiniProgramUser) {
    const label = user.nickname || user.openId || user.unionId || "这个用户";
    if (!window.confirm(`确认删除「${label}」吗？`)) return;
    setBusyId(user.id);
    const response = await fetch(`/api/admin/mini-users/${user.id}`, { method: "DELETE" });
    setBusyId(null);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data.message || "删除失败");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={createUser} className="grid gap-4 rounded-lg border border-susu-line bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">新增访问用户</h2>
            <p className="mt-1 text-sm text-susu-muted">至少填写 openId 或 unionId。新增后默认允许访问。</p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg border border-susu-line px-3 py-2 text-sm font-semibold">
            <input type="checkbox" checked={form.allowed} onChange={(event) => setForm({ ...form, allowed: event.target.checked })} />
            允许访问
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="OpenID">
            <Input value={form.openId} onChange={(event) => setForm({ ...form, openId: event.target.value })} placeholder="微信 openid" />
          </Field>
          <Field label="UnionID">
            <Input value={form.unionId} onChange={(event) => setForm({ ...form, unionId: event.target.value })} placeholder="微信 unionid，可选" />
          </Field>
          <Field label="昵称">
            <Input value={form.nickname} onChange={(event) => setForm({ ...form, nickname: event.target.value })} placeholder="方便后台识别" />
          </Field>
          <Field label="手机号">
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="可选" />
          </Field>
          <Field label="头像 URL">
            <div className="flex items-center gap-3">
              <Input value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} placeholder="可选" />
              <AvatarPreview avatarUrl={form.avatarUrl} nickname={form.nickname} />
            </div>
          </Field>
          <Field label="备注">
            <Input value={form.remark} onChange={(event) => setForm({ ...form, remark: event.target.value })} placeholder="比如：家人 / 朋友" />
          </Field>
        </div>
        <div>
          <Button type="submit" variant="primary" disabled={creating}>
            <Plus className="h-4 w-4" />
            {creating ? "新增中" : "新增用户"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-susu-line bg-white shadow-card">
        <div className="hidden grid-cols-[1fr_130px_130px_150px_210px] gap-4 border-b border-susu-line px-4 py-3 text-sm font-semibold text-susu-muted xl:grid">
          <span>用户</span>
          <span>状态</span>
          <span>来源</span>
          <span>最近检查</span>
          <span>操作</span>
        </div>
        <div className="grid">
          {users.map((user) => {
            const editing = editingId === user.id;
            return (
              <article key={user.id} className="grid gap-4 border-b border-susu-line p-4 last:border-b-0 xl:grid-cols-[1fr_130px_130px_150px_210px]">
                <div className="min-w-0">
                  {editing ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="OpenID">
                        <Input value={editForm.openId} onChange={(event) => setEditForm({ ...editForm, openId: event.target.value })} placeholder="OpenID" />
                      </Field>
                      <Field label="UnionID">
                        <Input value={editForm.unionId} onChange={(event) => setEditForm({ ...editForm, unionId: event.target.value })} placeholder="UnionID" />
                      </Field>
                      <Field label="昵称">
                        <Input value={editForm.nickname} onChange={(event) => setEditForm({ ...editForm, nickname: event.target.value })} placeholder="昵称" />
                      </Field>
                      <Field label="手机号">
                        <Input value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} placeholder="手机号" />
                      </Field>
                      <Field label="头像 URL">
                        <div className="flex items-center gap-3">
                          <Input value={editForm.avatarUrl} onChange={(event) => setEditForm({ ...editForm, avatarUrl: event.target.value })} placeholder="头像 URL" />
                          <AvatarPreview avatarUrl={editForm.avatarUrl} nickname={editForm.nickname} />
                        </div>
                      </Field>
                      <Field label="备注">
                        <Input value={editForm.remark} onChange={(event) => setEditForm({ ...editForm, remark: event.target.value })} placeholder="备注" />
                      </Field>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <AvatarPreview avatarUrl={user.avatarUrl || ""} nickname={user.nickname || ""} size="lg" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">{user.nickname || "未命名用户"}</span>
                          {user.remark ? <span className="rounded-md bg-peach-50 px-2 py-1 text-xs font-semibold text-peach-600">备注：{user.remark}</span> : null}
                        </div>
                        <div className="mt-2 grid gap-1 break-all text-xs leading-5 text-susu-muted">
                          <span>OpenID：{user.openId || "-"}</span>
                          <span>UnionID：{user.unionId || "-"}</span>
                          <span>昵称：{user.nickname || "-"}</span>
                          <span>手机号：{user.phone || "-"}</span>
                          <span>头像：{user.avatarUrl || "-"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  {editing ? (
                    <label className="inline-flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={editForm.allowed} onChange={(event) => setEditForm({ ...editForm, allowed: event.target.checked })} />
                      允许访问
                    </label>
                  ) : (
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold ${user.allowed ? "bg-[#eaf8f1] text-[#4c9f75]" : "bg-[#fff0f0] text-susu-red"}`}>
                      {user.allowed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      {user.allowed ? "已允许" : "未允许"}
                    </span>
                  )}
                </div>
                <div className="text-sm text-susu-muted">{user.source === "mini-program" ? "小程序上报" : "后台添加"}</div>
                <div className="text-sm text-susu-muted">{user.lastCheckedAt ? new Date(user.lastCheckedAt).toLocaleDateString("zh-CN") : "未检查"}</div>
                <div className="flex flex-wrap content-start gap-2">
                  {editing ? (
                    <>
                      <Button type="button" size="sm" variant="primary" onClick={() => updateUser(user.id, editForm)} disabled={busyId === user.id}>
                        <Save className="h-4 w-4" />
                        保存
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)} disabled={busyId === user.id}>
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button type="button" size="sm" variant="ghost" onClick={() => startEdit(user)}>
                        <Pencil className="h-4 w-4" />
                        编辑
                      </Button>
                      <Button type="button" size="sm" variant={user.allowed ? "secondary" : "primary"} onClick={() => updateUser(user.id, { ...userToForm(user), allowed: !user.allowed })} disabled={busyId === user.id}>
                        {user.allowed ? "禁用" : "允许"}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="text-susu-red" onClick={() => removeUser(user)} disabled={busyId === user.id}>
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
          {users.length === 0 ? <div className="p-10 text-center text-susu-muted">还没有小程序用户。</div> : null}
        </div>
      </div>
    </div>
  );
}

function userToForm(user: MiniProgramUser): FormState {
  return {
    openId: user.openId || "",
    unionId: user.unionId || "",
    nickname: user.nickname || "",
    avatarUrl: user.avatarUrl || "",
    phone: user.phone || "",
    remark: user.remark || "",
    allowed: user.allowed
  };
}

function AvatarPreview({
  avatarUrl,
  nickname,
  size = "md"
}: {
  avatarUrl: string;
  nickname?: string;
  size?: "md" | "lg";
}) {
  const className = size === "lg" ? "h-14 w-14" : "h-11 w-11";
  const initial = nickname?.trim().slice(0, 1) || "微";

  if (!avatarUrl) {
    return (
      <span className={`${className} grid flex-none place-items-center rounded-lg bg-peach-100 text-sm font-bold text-peach-600`}>
        {initial}
      </span>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={nickname ? `${nickname}的头像` : "小程序用户头像"}
      className={`${className} flex-none rounded-lg border border-susu-line bg-peach-50 object-cover`}
      referrerPolicy="no-referrer"
    />
  );
}
