import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { isPersonalAssetOpenIdAuthorized } from "@/server/personal-asset-config";

const issuer = "susu-personal-asset";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

function readBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return request.headers.get("x-personal-asset-token") || null;
}

export async function createPersonalAssetSession(openId: string) {
  return new SignJWT({ openId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setSubject(openId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function getPersonalAssetIdentity(request: NextRequest) {
  const token = readBearerToken(request);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer });
    const openId = typeof payload.openId === "string" ? payload.openId : payload.sub;
    if (!openId) return null;

    const authorized = await isPersonalAssetOpenIdAuthorized(openId);
    return {
      openId,
      authorized,
      dataScope: authorized ? ("real" as const) : ("demo" as const)
    };
  } catch {
    return null;
  }
}

export async function requirePersonalAssetIdentity(request: NextRequest) {
  const identity = await getPersonalAssetIdentity(request);
  if (!identity) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return identity;
}
