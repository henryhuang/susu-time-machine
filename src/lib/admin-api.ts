type GenerateStoryDraftPayload = {
  title: string;
  summary: string;
  storyDate: string;
  tags: string[];
  content: string;
  aiPrompt: string;
  imageUrls: string[];
};

export async function generateStoryDraft(payload: GenerateStoryDraftPayload) {
  const response = await fetch("/api/admin/stories/ai-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "正文生成失败");
  }

  return data as { content: string; summary?: string };
}
