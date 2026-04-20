import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseTags, normalizeTags } from "@/lib/tags";
import { StoryInput } from "@/lib/validators";
import { StoryDTO } from "@/types/story";

export function serializeStory<T extends { tags: string; storyDate: Date; createdAt: Date; updatedAt: Date }>(
  story: T & {
    id: string;
    title: string;
    summary: string;
    content: string;
    coverImage: string | null;
    images?: { id?: string; imageUrl: string; sortOrder: number; createdAt: Date }[];
  }
): StoryDTO {
  return {
    id: story.id,
    title: story.title,
    summary: story.summary,
    content: story.content,
    coverImage: story.coverImage,
    tags: parseTags(story.tags),
    images: story.images?.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      sortOrder: image.sortOrder,
      createdAt: image.createdAt.toISOString()
    })) ?? [],
    storyDate: story.storyDate.toISOString(),
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString()
  };
}

export async function listStories(options?: {
  page?: number;
  pageSize?: number;
  query?: string;
  tag?: string;
}) {
  const page = Math.max(options?.page || 1, 1);
  const pageSize = Math.min(Math.max(options?.pageSize || 10, 1), 50);
  const where: Prisma.StoryWhereInput = {};

  if (options?.query) {
    where.title = { contains: options.query };
  }

  if (options?.tag) {
    where.tags = { contains: options.tag };
  }

  const [items, total] = await Promise.all([
    prisma.story.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ storyDate: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.story.count({ where })
  ]);

  return {
    items: items.map(serializeStory),
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total
  };
}

export async function getStory(id: string) {
  const story = await prisma.story.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } }
  });

  return story ? serializeStory(story) : null;
}

export async function createStory(input: StoryInput) {
  return prisma.story.create({
    data: {
      title: input.title,
      summary: input.summary,
      content: input.content,
      storyDate: new Date(input.storyDate),
      coverImage: input.coverImage || input.images[0]?.imageUrl || null,
      tags: normalizeTags(input.tags),
      images: {
        create: input.images.map((image, index) => ({
          imageUrl: image.imageUrl,
          sortOrder: image.sortOrder ?? index
        }))
      }
    },
    include: { images: { orderBy: { sortOrder: "asc" } } }
  });
}

export async function updateStory(id: string, input: StoryInput) {
  return prisma.$transaction(async (tx) => {
    await tx.storyImage.deleteMany({ where: { storyId: id } });
    return tx.story.update({
      where: { id },
      data: {
        title: input.title,
        summary: input.summary,
        content: input.content,
        storyDate: new Date(input.storyDate),
        coverImage: input.coverImage || input.images[0]?.imageUrl || null,
        tags: normalizeTags(input.tags),
        images: {
          create: input.images.map((image, index) => ({
            imageUrl: image.imageUrl,
            sortOrder: image.sortOrder ?? index
          }))
        }
      },
      include: { images: { orderBy: { sortOrder: "asc" } } }
    });
  });
}
