export function Tag({ children, tone = "peach" }: { children: React.ReactNode; tone?: "peach" | "blue" | "green" | "gray" }) {
  const classes = {
    peach: "bg-peach-100 text-peach-600",
    blue: "bg-[#eaf5ff] text-[#3f86ba]",
    green: "bg-[#eaf8f1] text-[#4c9f75]",
    gray: "bg-[#f6f3f2] text-susu-muted"
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[tone]}`}>{children}</span>;
}
