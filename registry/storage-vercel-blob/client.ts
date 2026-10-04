import { upload } from "@vercel/blob/client";

import type { StoredFile } from "./types";

/**
 * Direct-from-client upload (no file bytes pass through our functions).
 * `GET /api/upload` returns the caller's key prefix (`${userId}/`); the same
 * route then enforces that prefix when issuing the upload token.
 */
export async function uploadFile(
  file: File,
  opts?: { folder?: string },
): Promise<StoredFile> {
  const res = await fetch("/api/upload");
  if (!res.ok) throw new Error("Not authorized to upload");
  const { prefix } = (await res.json()) as { prefix: string };

  const folder = opts?.folder?.replace(/^\/+|\/+$/g, "");
  const name = file.name.replace(/[^\w.-]+/g, "_");
  const pathname = `${prefix}${folder ? `${folder}/` : ""}${name}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });
  return { key: blob.pathname, url: blob.url };
}
