import { NextRequest } from "next/server";
import { clearPersonalAssetData } from "@/server/personal-assets";
import { getPersonalAssetOwner, handlePersonalAssetError, ok } from "../../_utils";

export async function DELETE(request: NextRequest) {
  try {
    const owner = await getPersonalAssetOwner(request);
    await clearPersonalAssetData(owner);
    return ok({ ok: true, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error, "清空数据失败");
  }
}
