export const fallbackImage =
  "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=80";

export function getImageUrl(url?: string | null) {
  return url && url.trim().length > 0 ? url : fallbackImage;
}
