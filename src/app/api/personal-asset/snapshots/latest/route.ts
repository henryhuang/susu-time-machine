import { NextRequest } from "next/server";
import { getLatestPersonalAssetSnapshot } from "@/server/personal-assets";
import { getPersonalAssetOwner, handlePersonalAssetError, ok } from "../../_utils";

export async function GET(request: NextRequest) {
  try {
    const owner = await getPersonalAssetOwner(request);
    const snapshot = await getLatestPersonalAssetSnapshot(owner);
    return ok({ snapshot, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error);
  }
}
