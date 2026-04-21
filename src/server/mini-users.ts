import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MiniProgramAccessCheckInput, MiniProgramUserInput } from "@/lib/validators";

type MiniProgramUserRecord = NonNullable<Awaited<ReturnType<typeof prisma.miniProgramUser.findFirst>>>;

export function serializeMiniProgramUser(user: MiniProgramUserRecord) {
  return {
    id: user.id,
    openId: user.openId,
    unionId: user.unionId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    remark: user.remark,
    allowed: user.allowed,
    source: user.source,
    lastCheckedAt: user.lastCheckedAt?.toISOString() ?? null,
    lastAllowedAt: user.lastAllowedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

function identityWhere(input: { openId?: string; unionId?: string }) {
  return [
    input.unionId ? { unionId: input.unionId } : null,
    input.openId ? { openId: input.openId } : null
  ].filter(Boolean) as Prisma.MiniProgramUserWhereInput[];
}

function accessProfileData(input: MiniProgramAccessCheckInput) {
  return {
    ...(input.openId ? { openId: input.openId } : {}),
    ...(input.unionId ? { unionId: input.unionId } : {}),
    ...(input.nickname ? { nickname: input.nickname } : {}),
    ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
    ...(input.phone ? { phone: input.phone } : {})
  };
}

function editableProfileData(input: MiniProgramUserInput) {
  return {
    openId: input.openId,
    unionId: input.unionId,
    nickname: input.nickname,
    avatarUrl: input.avatarUrl,
    phone: input.phone
  };
}

export async function checkMiniProgramAccess(input: MiniProgramAccessCheckInput) {
  const now = new Date();
  const existing = await prisma.miniProgramUser.findFirst({
    where: { OR: identityWhere(input) }
  });

  const user = existing
    ? await prisma.miniProgramUser.update({
        where: { id: existing.id },
        data: {
          ...accessProfileData(input),
          lastCheckedAt: now,
          lastAllowedAt: existing.allowed ? now : existing.lastAllowedAt
        }
      })
    : await prisma.miniProgramUser.create({
        data: {
          ...accessProfileData(input),
          source: "mini-program",
          allowed: false,
          lastCheckedAt: now
        }
      });

  return {
    allowed: user.allowed,
    permissions: user.allowed ? ["story:read"] : [],
    user: serializeMiniProgramUser(user)
  };
}

export async function listMiniProgramUsers(options?: {
  page?: number;
  pageSize?: number;
  query?: string;
  allowed?: boolean;
}) {
  const page = Math.max(options?.page || 1, 1);
  const pageSize = Math.min(Math.max(options?.pageSize || 20, 1), 100);
  const where: Prisma.MiniProgramUserWhereInput = {};

  if (typeof options?.allowed === "boolean") {
    where.allowed = options.allowed;
  }

  if (options?.query) {
    where.OR = [
      { openId: { contains: options.query } },
      { unionId: { contains: options.query } },
      { nickname: { contains: options.query } },
      { phone: { contains: options.query } },
      { remark: { contains: options.query } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.miniProgramUser.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.miniProgramUser.count({ where })
  ]);

  return {
    items: items.map(serializeMiniProgramUser),
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total
  };
}

export async function createMiniProgramUser(input: MiniProgramUserInput) {
  return prisma.miniProgramUser.create({
    data: {
      ...editableProfileData(input),
      remark: input.remark,
      allowed: input.allowed,
      source: "manual"
    }
  });
}

export async function updateMiniProgramUser(id: string, input: MiniProgramUserInput) {
  return prisma.miniProgramUser.update({
    where: { id },
    data: {
      ...editableProfileData(input),
      remark: input.remark,
      allowed: input.allowed
    }
  });
}
