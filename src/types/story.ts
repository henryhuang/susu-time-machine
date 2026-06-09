export type StoryImageDTO = {
  id?: string;
  imageUrl: string;
  sortOrder: number;
  createdAt?: string;
};

export type StoryDTO = {
  id: string;
  title: string;
  slug: string | null;
  summary: string;
  content: string;
  location: string;
  coverImage: string | null;
  storyDate: string;
  tags: string[];
  images: StoryImageDTO[];
  createdAt: string;
  updatedAt: string;
};
