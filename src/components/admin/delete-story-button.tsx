"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteStoryButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    const ok = window.confirm(`确认删除「${title}」吗？\n\n默认只删除数据库记录，不会自动删除 COS 中的原图文件。`);
    if (!ok) return;
    setDeleting(true);
    const response = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (response.ok) {
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      alert(data.message || "删除失败");
    }
  }

  return (
    <Button type="button" size="sm" variant="ghost" className="text-susu-red" onClick={remove} disabled={deleting}>
      {deleting ? "删除中" : "删除"}
    </Button>
  );
}
