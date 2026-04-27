import { NextRequest } from "next/server";
import { exportPersonalAssetData } from "@/server/personal-assets";
import { getPersonalAssetOwner, handlePersonalAssetError, ok } from "../../_utils";

export async function GET(request: NextRequest) {
  try {
    const owner = await getPersonalAssetOwner(request);
    const data = await exportPersonalAssetData(owner);
    return ok({ ...data, authorized: owner.authorized });
  } catch (error) {
    return handlePersonalAssetError(error);
  }
}
