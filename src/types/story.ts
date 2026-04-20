export type StoryImageDTO = {
  id?: string;
  imageUrl: string;
  sortOrder: number;
  createdAt?: string;
};

export type StoryDTO = {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  storyDate: string;
  tags: string[];
  images: StoryImageDTO[];
  createdAt: string;
  updatedAt: string;
};
