import { notFound } from "next/navigation";
import { StoryForm } from "@/components/admin/story-form";
import { ProtectedAdmin } from "@/components/admin/protected-admin";
import { getStory } from "@/server/stories";

export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) notFound();

  return (
    <ProtectedAdmin>
      <div className="mb-5">
        <p className="font-semibold text-peach-600">编辑故事</p>
        <h1 className="mt-2 text-2xl font-extrabold">{story.title}</h1>
      </div>
      <StoryForm story={story} />
    </ProtectedAdmin>
  );
}
