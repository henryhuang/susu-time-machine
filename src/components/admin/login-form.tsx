"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message || "登录失败");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="用户名">
        <Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
      </Field>
      <Field label="密码">
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
      </Field>
      {error ? <div className="rounded-lg bg-[#fdecef] px-3 py-2 text-sm font-semibold text-susu-red">{error}</div> : null}
      <Button variant="primary" size="lg" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
    </form>
  );
}
