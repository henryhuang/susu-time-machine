export function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === "string") : [];
  } catch {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}

export function normalizeTags(value: string[] | string | undefined): string {
  const tags = Array.isArray(value)
    ? value
    : (value || "")
        .split(/[,，]/)
        .map((tag) => tag.trim());
  return JSON.stringify(Array.from(new Set(tags.filter(Boolean))));
}
