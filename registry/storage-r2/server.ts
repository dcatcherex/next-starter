import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

const r2Env = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional(),
});

let cached: { client: S3Client; cfg: z.infer<typeof r2Env> } | undefined;

function r2() {
  if (!cached) {
    const cfg = r2Env.parse({
      ...process.env,
      R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || undefined,
    });
    cached = {
      cfg,
      client: new S3Client({
        region: "auto",
        endpoint: `https://${cfg.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: cfg.R2_ACCESS_KEY_ID,
          secretAccessKey: cfg.R2_SECRET_ACCESS_KEY,
        },
      }),
    };
  }
  return cached;
}

/** Public URL if `R2_PUBLIC_URL` is set, otherwise a 1h presigned GET URL. */
export async function getFileUrl(key: string): Promise<string> {
  const { client, cfg } = r2();
  if (cfg.R2_PUBLIC_URL) {
    return `${cfg.R2_PUBLIC_URL.replace(/\/+$/, "")}/${key}`;
  }
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: cfg.R2_BUCKET, Key: key }),
    { expiresIn: 3600 },
  );
}

export async function deleteFile(key: string): Promise<void> {
  const { client, cfg } = r2();
  await client.send(
    new DeleteObjectCommand({ Bucket: cfg.R2_BUCKET, Key: key }),
  );
}
