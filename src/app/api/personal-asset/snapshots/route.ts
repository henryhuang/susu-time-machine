import { NextRequest } from "next/server";
import { personalAssetSnapshotInputSchema } from "@/lib/validators";
import { createPersonalAssetSnapshot, listPersonalAssetSnapshots } from "@/server/personal-assets";
import { fail, getPersonalAssetOwner, handlePersonalAssetError, ok, readJson } from "../_utils";

export async function GET(request: NextRequest) {
  try {
    const owner = await getPersonalAssetOwner(request);
    const snapshots = await listPersonalAssetSnapshots(owner);
    return ok({ snapshots, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error, "请求处理失败", request);
  }
}

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const parsed = personalAssetSnapshotInputSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "快照数据不正确", 400);
  }

  try {
    const owner = await getPersonalAssetOwner(request);
    const snapshot = await createPersonalAssetSnapshot(owner, parsed.data);
    return ok({ snapshot, authorized: owner.authorized }, { status: 201 });
  } catch (error) {
    return handlePersonalAssetError(error, "快照保存失败", request);
  }
}
