import OpenAI from "openai";

type GenerateStoryContentInput = {
  title: string;
  summary: string;
  storyDate: string;
  tags: string[];
  content: string;
  aiPrompt: string;
  imageUrls: string[];
};

type GeneratedStoryDraft = {
  content: string;
  summary?: string;
};

type ChatMessage =
  | { role: "system"; content: string }
  | {
      role: "user";
      content:
        | string
        | Array<
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string } }
          >;
    };

let client: OpenAI | null = null;

function getClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is not configured.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
      timeout: Number(process.env.AI_REQUEST_TIMEOUT_MS || 45000)
    });
  }

  return client;
}

function buildPrompt(input: GenerateStoryContentInput) {
  const shouldGenerateSummary = !input.summary.trim();
  const shouldGenerateContent = !input.content.trim();
  const lines = [
    `标题：${input.title || "未填写"}`,
    `摘要：${input.summary || "未填写"}`,
    `故事日期：${input.storyDate || "未填写"}`,
    `标签：${input.tags.length > 0 ? input.tags.join("、") : "未填写"}`,
    `已有正文：${input.content || "无"}`,
    `我想表达的关键语句：${input.aiPrompt || "未填写"}`,
    `是否需要生成摘要：${shouldGenerateSummary ? "是，摘要为空，请生成 summary" : "否，摘要已有内容，不要生成 summary"}`,
    `是否需要生成正文：${shouldGenerateContent ? "是，正文为空，请生成 content" : "否，正文已有内容，不要生成 content"}`
  ];

  lines.push("请基于以上信息生成缺失字段，并严格遵守不覆盖已有摘要和正文的要求。");

  return lines.join("\n\n");
}

function systemPrompt() {
  return [
    "你是一位擅长撰写家庭成长记录的中文写作者。",
    "请输出简体中文正文，长度控制在 120 到 220 字。",
    "文风要温柔、真实、有纪念感，但不要过度煽情，不要夸张。",
    "不要编造用户没有提供、也无法确认的细节。",
    "如果信息不足，就基于标题、摘要、日期、标签和已有正文做自然扩写。",
    "优先尊重“我想表达的关键语句”，把它作为情绪重点和表达方向，但不要生硬照抄。",
    "如果提供了图片，只把图片中能明确观察到的内容作为辅助，不要猜测无法确认的人物身份、地点、关系或事件。",
    "必须只输出 JSON，不要输出 Markdown、解释、代码块或额外文本。",
    "JSON 可包含字段：content 和 summary。",
    "content 是 120 到 220 字正文；summary 是 50 字以内摘要。",
    "如果用户已有摘要，不要生成 summary 字段。",
    "如果用户已有正文，不要生成 content 字段。"
  ].join("\n");
}

function parseDraft(text: string): GeneratedStoryDraft {
  const normalized = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(normalized) as Partial<GeneratedStoryDraft>;
    if (typeof parsed.content === "string" && parsed.content.trim()) {
      return {
        content: parsed.content.trim(),
        summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : undefined
      };
    }
  } catch {
    // Fall through and treat the model output as plain content.
  }

  return { content: normalized };
}

async function complete(messages: ChatMessage[]): Promise<GeneratedStoryDraft> {
  const model = process.env.QWEN_MODEL || "qwen3.6-plus";

  const completion = await getClient().chat.completions.create({
    model,
    temperature: 0.7,
    messages
  });

  const text = completion.choices[0]?.message?.content?.trim();

  console.log("[AI] complete:completed", {
    usage: completion.usage,
    finishReason: completion.choices[0]?.finish_reason,
    outputLength: text?.length || 0
  });

  if (!text) {
    throw new Error("AI did not return any text.");
  }

  return parseDraft(text);
}

async function generateTextOnly(prompt: string) {
  console.log("[AI] generateTextOnly:start");

  return complete([
    {
      role: "system",
      content: systemPrompt()
    },
    {
      role: "user",
      content: prompt
    }
  ]);
}

async function generateWithImages(prompt: string, imageUrls: string[]) {
  const maxImages = Number(process.env.AI_MAX_IMAGE_INPUTS || 3);
  const selectedImageUrls = imageUrls.filter(Boolean).slice(0, maxImages);

  console.log("[AI] generateWithImages:start", {
    imageCount: selectedImageUrls.length,
    maxImages
  });

  return complete([
    {
      role: "system",
      content: systemPrompt()
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `${prompt}\n\n请结合随附图片中能明确观察到的内容作为辅助。如果图片无法读取，请仅根据文字信息生成。`
        },
        ...selectedImageUrls.map((url) => ({
          type: "image_url" as const,
          image_url: { url }
        }))
      ]
    }
  ]);
}

export async function generateStoryContent(input: GenerateStoryContentInput): Promise<GeneratedStoryDraft> {
  const model = process.env.QWEN_MODEL || "qwen3.6-plus";
  const prompt = buildPrompt(input);
  const imageUrls = input.imageUrls.filter(Boolean);

  console.log("[AI] generateStoryContent:start", {
    model,
    titleLength: input.title.length,
    summaryLength: input.summary.length,
    contentLength: input.content.length,
    aiPromptLength: input.aiPrompt.length,
    tagCount: input.tags.length,
    imageCount: imageUrls.length,
    timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || 45000)
  });

  try {
    if (imageUrls.length > 0) {
      try {
        return await generateWithImages(prompt, imageUrls);
      } catch (imageError) {
        console.warn("[AI] generateWithImages:fallbackToText", {
          message: imageError instanceof Error ? imageError.message : String(imageError)
        });
      }
    }

    return await generateTextOnly(prompt);
  } catch (error) {
    console.error("[AI] generateStoryContent:error", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError"
    });
    throw error;
  }
}
