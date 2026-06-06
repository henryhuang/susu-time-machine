import { headers } from "next/headers";

const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl = process.env.APP_URL?.trim();
  return new URL(configuredUrl || fallbackSiteUrl);
}

export async function getRequestSiteUrl() {
  const configuredUrl = getSiteUrl();
  if (!["localhost", "127.0.0.1"].includes(configuredUrl.hostname)) {
    return configuredUrl;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!host) return configuredUrl;

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return new URL(`${protocol}://${host}`);
}

export function absoluteUrl(value: string, baseUrl = getSiteUrl()) {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(value, baseUrl).toString();
  }
}
