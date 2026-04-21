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

const optionalProfileText = z
  .string()
  .trim()
  .max(240, "内容不要超过 240 个字")
  .nullish()
  .transform((value) => value || undefined);

const optionalProfileUrl = z
  .string()
  .trim()
  .max(1000, "链接不要超过 1000 个字")
  .nullish()
  .transform((value) => value || undefined);

export const miniProgramAccessCheckSchema = z
  .object({
    openId: optionalProfileText,
    unionId: optionalProfileText
  })
  .refine((value) => value.openId || value.unionId, {
    message: "请提供 openId 或 unionId"
  });

export const miniProgramAccessApplySchema = z
  .object({
    openId: optionalProfileText,
    unionId: optionalProfileText,
    nickname: optionalProfileText,
    avatarUrl: optionalProfileUrl
  })
  .refine((value) => value.openId || value.unionId, {
    message: "请提供 openId 或 unionId"
  });

export const miniProgramLoginSchema = z.object({
  code: z
    .string({
      required_error: "请提供微信登录 code",
      invalid_type_error: "请提供微信登录 code"
    })
    .trim()
    .min(1, "请提供微信登录 code")
});

export const miniProgramUserInputSchema = z
  .object({
    openId: optionalProfileText,
    unionId: optionalProfileText,
    nickname: optionalProfileText,
    avatarUrl: optionalProfileUrl,
    phone: optionalProfileText,
    remark: optionalProfileText,
    allowed: z.boolean().default(true)
  })
  .refine((value) => value.openId || value.unionId, {
    message: "请填写 openId 或 unionId"
  });

export type MiniProgramAccessCheckInput = z.infer<typeof miniProgramAccessCheckSchema>;
export type MiniProgramAccessApplyInput = z.infer<typeof miniProgramAccessApplySchema>;
export type MiniProgramLoginInput = z.infer<typeof miniProgramLoginSchema>;
export type MiniProgramUserInput = z.infer<typeof miniProgramUserInputSchema>;
