import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PersonalAssetSnapshotImportInput, PersonalAssetSnapshotInput } from "@/lib/validators";
import { getDemoSnapshots } from "@/server/personal-asset-demo";

type PersonalAssetScope = "real" | "demo";

type PersonalAssetOwner = {
  openId: string;
  dataScope: PersonalAssetScope;
};

type PersonalAssetSnapshotRecord = {
  id: string;
  recordDate: Date;
  title: string;
  remark: string;
  assets: Prisma.JsonValue;
  loans: Prisma.JsonValue;
  cards: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeRecordDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

function buildSnapshotId() {
  return `snapshot_${randomUUID()}`;
}

function snapshotData(input: PersonalAssetSnapshotInput) {
  return {
    recordDate: normalizeRecordDate(input.recordDate),
    title: input.title,
    remark: input.remark,
    assets: input.assets as Prisma.InputJsonValue,
    loans: input.loans as Prisma.InputJsonValue,
    cards: input.cards as Prisma.InputJsonValue
  };
}

export function serializePersonalAssetSnapshot(snapshot: PersonalAssetSnapshotRecord) {
  return {
    id: snapshot.id,
    recordDate: snapshot.recordDate.toISOString().slice(0, 10),
    title: snapshot.title,
    remark: snapshot.remark,
    assets: Array.isArray(snapshot.assets) ? snapshot.assets : [],
    loans: Array.isArray(snapshot.loans) ? snapshot.loans : [],
    cards: Array.isArray(snapshot.cards) ? snapshot.cards : [],
    createdAt: snapshot.createdAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString()
  };
}

async function ensureDemoSnapshots(owner: PersonalAssetOwner) {
  if (owner.dataScope !== "demo") return;

  const count = await prisma.personalAssetSnapshot.count({
    where: { ownerOpenId: owner.openId, dataScope: "demo" }
  });
  if (count > 0) return;

  await prisma.personalAssetSnapshot.createMany({
    data: getDemoSnapshots().map((snapshot) => ({
      id: snapshot.id || buildSnapshotId(),
      ownerOpenId: owner.openId,
      dataScope: "demo",
      ...snapshotData(snapshot)
    }))
  });
}

function ownerWhere(owner: PersonalAssetOwner) {
  return {
    ownerOpenId: owner.openId,
    dataScope: owner.dataScope
  };
}

export async function listPersonalAssetSnapshots(owner: PersonalAssetOwner) {
  await ensureDemoSnapshots(owner);
  const snapshots = await prisma.personalAssetSnapshot.findMany({
    where: ownerWhere(owner),
    orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }]
  });

  return snapshots.map(serializePersonalAssetSnapshot);
}

export async function getLatestPersonalAssetSnapshot(owner: PersonalAssetOwner) {
  await ensureDemoSnapshots(owner);
  const snapshot = await prisma.personalAssetSnapshot.findFirst({
    where: ownerWhere(owner),
    orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }]
  });

  return snapshot ? serializePersonalAssetSnapshot(snapshot) : null;
}

export async function getPersonalAssetSnapshot(owner: PersonalAssetOwner, id: string) {
  await ensureDemoSnapshots(owner);
  const snapshot = await prisma.personalAssetSnapshot.findUnique({
    where: {
      ownerOpenId_dataScope_id: {
        ...ownerWhere(owner),
        id
      }
    }
  });

  return snapshot ? serializePersonalAssetSnapshot(snapshot) : null;
}

export async function createPersonalAssetSnapshot(owner: PersonalAssetOwner, input: PersonalAssetSnapshotInput) {
  const snapshot = await prisma.personalAssetSnapshot.create({
    data: {
      id: input.id || buildSnapshotId(),
      ownerOpenId: owner.openId,
      dataScope: owner.dataScope,
      ...snapshotData(input)
    }
  });

  return serializePersonalAssetSnapshot(snapshot);
}

export async function updatePersonalAssetSnapshot(
  owner: PersonalAssetOwner,
  id: string,
  input: PersonalAssetSnapshotInput
) {
  const snapshot = await prisma.personalAssetSnapshot.update({
    where: {
      ownerOpenId_dataScope_id: {
        ...ownerWhere(owner),
        id
      }
    },
    data: snapshotData(input)
  });

  return serializePersonalAssetSnapshot(snapshot);
}

export async function deletePersonalAssetSnapshot(owner: PersonalAssetOwner, id: string) {
  await prisma.personalAssetSnapshot.delete({
    where: {
      ownerOpenId_dataScope_id: {
        ...ownerWhere(owner),
        id
      }
    }
  });
}

export async function exportPersonalAssetData(owner: PersonalAssetOwner) {
  const snapshots = await listPersonalAssetSnapshots(owner);
  return { snapshots };
}

export async function importPersonalAssetData(owner: PersonalAssetOwner, input: PersonalAssetSnapshotImportInput) {
  return prisma.$transaction(async (tx) => {
    await tx.personalAssetSnapshot.deleteMany({ where: ownerWhere(owner) });

    for (const snapshot of input.snapshots) {
      await tx.personalAssetSnapshot.create({
        data: {
          id: snapshot.id || buildSnapshotId(),
          ownerOpenId: owner.openId,
          dataScope: owner.dataScope,
          ...snapshotData(snapshot)
        }
      });
    }

    const snapshots = await tx.personalAssetSnapshot.findMany({
      where: ownerWhere(owner),
      orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }]
    });

    return snapshots.map(serializePersonalAssetSnapshot);
  });
}

export async function appendPersonalAssetData(owner: PersonalAssetOwner, input: PersonalAssetSnapshotImportInput) {
  return prisma.$transaction(async (tx) => {
    for (const snapshot of input.snapshots) {
      const id = snapshot.id || buildSnapshotId();
      await tx.personalAssetSnapshot.upsert({
        where: {
          ownerOpenId_dataScope_id: {
            ...ownerWhere(owner),
            id
          }
        },
        create: {
          id,
          ownerOpenId: owner.openId,
          dataScope: owner.dataScope,
          ...snapshotData(snapshot)
        },
        update: snapshotData(snapshot)
      });
    }

    const snapshots = await tx.personalAssetSnapshot.findMany({
      where: ownerWhere(owner),
      orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }]
    });

    return snapshots.map(serializePersonalAssetSnapshot);
  });
}

export async function clearPersonalAssetData(owner: PersonalAssetOwner) {
  await prisma.personalAssetSnapshot.deleteMany({ where: ownerWhere(owner) });
}
