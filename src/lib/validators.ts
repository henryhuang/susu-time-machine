import { z } from "zod";

export const storyInputSchema = z.object({
  title: z.string().min(1, "请填写标题").max(80, "标题不要超过 80 个字"),
  summary: z.string().min(1, "请填写摘要").max(240, "摘要不要超过 240 个字"),
  content: z.string().min(1, "请填写正文"),
  storyDate: z.string().min(1, "请选择故事日期"),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().url("封面图地址不正确").or(z.literal("")).optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        sortOrder: z.number().int().min(0).default(0)
      })
    )
    .default([])
});

export type StoryInput = z.infer<typeof storyInputSchema>;
