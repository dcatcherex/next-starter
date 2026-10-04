import type { StoredFile } from "./types";

/**
 * Direct-from-client upload: ask `/api/upload` for a presigned PUT URL, then
 * PUT the file straight to R2. The bucket needs a CORS rule allowing PUT from
 * the app origin (see README).
 */
export async function uploadFile(
  file: File,
  opts?: { folder?: string },
): Promise<StoredFile> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      folder: opts?.folder,
    }),
  });
  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(error ?? "Failed to get upload URL");
  }
  const { uploadUrl, key, readUrl } = (await res.json()) as {
    uploadUrl: string;
    key: string;
    readUrl: string;
  };

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);

  return { key, url: readUrl };
}
