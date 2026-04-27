import { NextRequest } from "next/server";
import { personalAssetSnapshotInputSchema } from "@/lib/validators";
import {
  deletePersonalAssetSnapshot,
  getPersonalAssetSnapshot,
  updatePersonalAssetSnapshot
} from "@/server/personal-assets";
import { fail, getPersonalAssetOwner, handlePersonalAssetError, ok, readJson } from "../../_utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const owner = await getPersonalAssetOwner(request);
    const { id } = await params;
    const snapshot = await getPersonalAssetSnapshot(owner, id);
    if (!snapshot) {
      return fail("快照不存在或无权访问", 404);
    }
    return ok({ snapshot, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error, "请求处理失败", request);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await readJson(request);
  const parsed = personalAssetSnapshotInputSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "快照数据不正确", 400);
  }

  try {
    const owner = await getPersonalAssetOwner(request);
    const { id } = await params;
    const snapshot = await updatePersonalAssetSnapshot(owner, id, parsed.data);
    return ok({ snapshot, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error, "快照保存失败", request);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const owner = await getPersonalAssetOwner(request);
    const { id } = await params;
    await deletePersonalAssetSnapshot(owner, id);
    return ok({ ok: true, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error, "快照删除失败", request);
  }
}
