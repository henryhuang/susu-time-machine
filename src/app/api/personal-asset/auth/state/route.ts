import { NextRequest } from "next/server";
import { getPersonalAssetIdentity } from "@/server/personal-asset-auth";
import { fail, ok } from "../../_utils";

export async function GET(request: NextRequest) {
  const identity = await getPersonalAssetIdentity(request);
  if (!identity) {
    return fail("Unauthorized", 401);
  }

  return ok({
    openid: identity.openId,
    openId: identity.openId,
    authorized: identity.authorized
  });
}
