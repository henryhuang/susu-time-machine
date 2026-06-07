import COS from "cos-nodejs-sdk-v5";
import { randomUUID } from "crypto";

export function getCosClient() {
  const SecretId = process.env.TENCENT_COS_SECRET_ID;
  const SecretKey = process.env.TENCENT_COS_SECRET_KEY;
  if (!SecretId || !SecretKey) {
    throw new Error("Tencent COS credentials are not configured.");
  }
  return new COS({ SecretId, SecretKey });
}

export function getCosConfig() {
  const Bucket = process.env.TENCENT_COS_BUCKET;
  const Region = process.env.TENCENT_COS_REGION;
  if (!Bucket || !Region) {
    throw new Error("TENCENT_COS_BUCKET and TENCENT_COS_REGION are required.");
  }
  return { Bucket, Region };
}

export function buildObjectKey(filename: string) {
  const prefix = process.env.TENCENT_COS_UPLOAD_PREFIX || "susu/stories";
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
  const safeExt = (ext || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const random = randomUUID();
  return `${prefix}/${year}/${month}/${random}.${safeExt}`;
}

export function buildHeroObjectKeys(sourceExtension: string) {
  const prefix = (process.env.TENCENT_COS_UPLOAD_PREFIX || "susu/stories").replace(/\/$/, "");
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const id = randomUUID();
  const base = `${prefix}/hero/${year}/${month}`;

  return {
    original: `${base}/original/${id}.${sourceExtension}`,
    processed: (suffix: string) => `${base}/processed/${id}-${suffix}`
  };
}

export async function putCosObject(key: string, body: Buffer, contentType: string) {
  const cos = getCosClient();
  const { Bucket, Region } = getCosConfig();

  await new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket,
        Region,
        Key: key,
        Body: body,
        ContentType: contentType
      },
      (error, data) => {
        if (error) reject(error);
        else resolve(data);
      }
    );
  });
}

export function publicUrlForKey(key: string) {
  const base = process.env.TENCENT_COS_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  const { Bucket, Region } = getCosConfig();
  return `https://${Bucket}.cos.${Region}.myqcloud.com/${key}`;
}
