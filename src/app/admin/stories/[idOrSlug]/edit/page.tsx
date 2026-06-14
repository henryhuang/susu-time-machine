import { notFound } from "next/navigation";
import { StoryForm } from "@/components/admin/story-form";
import { ProtectedAdmin } from "@/components/admin/protected-admin";
import { getStory } from "@/server/stories";
import { getChildProfile } from "@/lib/child-profile";

export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await params;
  const [story, child] = await Promise.all([getStory(idOrSlug), getChildProfile()]);
  if (!story) notFound();

  return (
    <ProtectedAdmin>
      <div className="mb-5">
        <p className="font-semibold text-peach-600">编辑故事</p>
        <h1 className="mt-2 text-2xl font-extrabold">{story.title}</h1>
      </div>
      <StoryForm story={story} displayName={child.displayName} />
    </ProtectedAdmin>
  );
}
