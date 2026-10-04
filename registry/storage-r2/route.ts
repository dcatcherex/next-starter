import { auth } from "@clerk/nextjs/server";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const bodySchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine((t) => ALLOWED_CONTENT_TYPES.includes(t), {
    message: "Unsupported content type",
  }),
  size: z.number().int().positive().max(MAX_SIZE),
  folder: z.string().max(100).optional(),
});

const r2Env = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }
  const { filename, contentType, size, folder } = parsed.data;

  const cfg = r2Env.parse({
    ...process.env,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || undefined,
  });
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${cfg.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.R2_ACCESS_KEY_ID,
      secretAccessKey: cfg.R2_SECRET_ACCESS_KEY,
    },
  });

  const safeName = filename.replace(/[^\w.-]+/g, "_");
  const safeFolder = (folder ?? "")
    .split("/")
    .map((s) => s.replace(/[^\w-]+/g, "_"))
    .filter(Boolean)
    .join("/");
  const key = [userId, safeFolder, `${crypto.randomUUID()}-${safeName}`]
    .filter(Boolean)
    .join("/");

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: cfg.R2_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    }),
    { expiresIn: 300 },
  );

  // URL to read the file back: public if configured, else 1h presigned GET.
  const readUrl = cfg.R2_PUBLIC_URL
    ? `${cfg.R2_PUBLIC_URL.replace(/\/+$/, "")}/${key}`
    : await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: cfg.R2_BUCKET, Key: key }),
        { expiresIn: 3600 },
      );

  return NextResponse.json({ uploadUrl, key, readUrl });
}
