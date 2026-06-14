import { StoryForm } from "@/components/admin/story-form";
import { ProtectedAdmin } from "@/components/admin/protected-admin";
import { prisma } from "@/lib/prisma";
import { getChildProfile } from "@/lib/child-profile";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const [defaultLocation, child] = await Promise.all([
    prisma.siteConfig
      .findUnique({ where: { key: "default_story_location" } })
      .then((config) => config?.value || "")
      .catch(() => ""),
    getChildProfile()
  ]);

  return (
    <ProtectedAdmin>
      <div className="mb-5">
        <p className="font-semibold text-peach-600">新增故事</p>
        <h1 className="mt-2 text-2xl font-extrabold">把新的成长瞬间放进时光机</h1>
      </div>
      <StoryForm defaultLocation={defaultLocation} displayName={child.displayName} />
    </ProtectedAdmin>
  );
}
