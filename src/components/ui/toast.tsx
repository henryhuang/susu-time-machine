"use client";

export function Toast({
  message,
  tone = "error",
  onClose
}: {
  message: string;
  tone?: "error" | "success";
  onClose?: () => void;
}) {
  const tones = {
    error: "border-[#f4c7cf] bg-[#fff7f8] text-susu-red",
    success: "border-[#cbe9d7] bg-[#f4fbf7] text-[#2f7a50]"
  };

  return (
    <div className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm font-semibold shadow-popover ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{message}</div>
        {onClose ? (
          <button type="button" onClick={onClose} className="text-xs opacity-70 transition hover:opacity-100">
            关闭
          </button>
        ) : null}
      </div>
    </div>
  );
}
