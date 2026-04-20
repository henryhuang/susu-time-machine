import { StoryForm } from "@/components/admin/story-form";
import { ProtectedAdmin } from "@/components/admin/protected-admin";

export const dynamic = "force-dynamic";

export default function NewStoryPage() {
  return (
    <ProtectedAdmin>
      <div className="mb-5">
        <p className="font-semibold text-peach-600">新增故事</p>
        <h1 className="mt-2 text-2xl font-extrabold">把新的成长瞬间放进时光机</h1>
      </div>
      <StoryForm />
    </ProtectedAdmin>
  );
}
