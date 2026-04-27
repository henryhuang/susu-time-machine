import { NextRequest } from "next/server";
import { personalAssetSnapshotImportSchema } from "@/lib/validators";
import { appendPersonalAssetData } from "@/server/personal-assets";
import { fail, getPersonalAssetOwner, handlePersonalAssetError, ok, readJson } from "../../../_utils";

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const parsed = personalAssetSnapshotImportSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "导入数据不正确", 400);
  }

  try {
    const owner = await getPersonalAssetOwner(request);
    const snapshots = await appendPersonalAssetData(owner, parsed.data);
    return ok({ snapshots, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error, "追加导入失败");
  }
}
