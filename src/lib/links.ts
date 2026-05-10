export function storyHref(story: { id: string; slug: string | null }): string {
  return `/stories/${story.slug || story.id}`;
}
