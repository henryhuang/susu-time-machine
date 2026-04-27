import { prisma } from "@/lib/prisma";

function parseOpenIds(value: string | undefined) {
  return new Set(
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

export function getConfiguredPersonalAssetOpenIds() {
  return parseOpenIds(process.env.PERSONAL_ASSET_AUTHORIZED_OPENIDS);
}

export async function isPersonalAssetOpenIdAuthorized(openId: string) {
  const configuredOpenIds = getConfiguredPersonalAssetOpenIds();
  if (configuredOpenIds.has(openId)) return true;

  const user = await prisma.miniProgramUser.findFirst({
    where: { openId },
    select: { allowed: true }
  });

  return user?.allowed === true;
}
