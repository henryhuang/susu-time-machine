import { prisma } from "@/lib/prisma";

export const CHILD_PROFILE_KEYS = [
  "child_name",
  "child_nickname",
  "child_display_name",
  "child_birthday",
  "child_gender"
] as const;

export type ChildGender = "" | "female" | "male" | "other";

export type ChildProfile = {
  name: string;
  nickname: string;
  displayName: string;
  birthday: string;
  gender: ChildGender;
};

export const defaultChildProfile: ChildProfile = {
  name: "",
  nickname: "",
  displayName: "酥酥",
  birthday: "",
  gender: ""
};

export async function getChildProfile(): Promise<ChildProfile> {
  const configs = await prisma.siteConfig
    .findMany({ where: { key: { in: [...CHILD_PROFILE_KEYS] } } })
    .catch(() => []);
  const values = Object.fromEntries(configs.map((config) => [config.key, config.value]));
  const gender = ["female", "male", "other"].includes(values.child_gender)
    ? (values.child_gender as ChildGender)
    : "";

  return {
    name: values.child_name?.trim() || "",
    nickname: values.child_nickname?.trim() || "",
    displayName: values.child_display_name?.trim() || defaultChildProfile.displayName,
    birthday: values.child_birthday || "",
    gender
  };
}
