import "server-only";

import { del, head } from "@vercel/blob";

/** Public URL for a stored file. `key` is the blob pathname (`${userId}/...`). */
export async function getFileUrl(key: string): Promise<string> {
  const blob = await head(key);
  return blob.url;
}

export async function deleteFile(key: string): Promise<void> {
  await del(key);
}
