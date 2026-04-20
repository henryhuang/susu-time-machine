import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold text-susu-text">{label}</span>
      {children}
      {hint ? <span className="text-xs text-susu-muted">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-11 rounded-lg border border-susu-line bg-white px-3 text-sm outline-none transition focus:border-peach-500 focus:ring-4 focus:ring-peach-100"
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-28 rounded-lg border border-susu-line bg-white px-3 py-3 text-sm outline-none transition focus:border-peach-500 focus:ring-4 focus:ring-peach-100"
      {...props}
    />
  );
}
