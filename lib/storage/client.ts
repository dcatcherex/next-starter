import type { StoredFile } from "./types";

const MISSING =
  "No storage provider installed. Run: pnpm dlx shadcn add @starter/storage-vercel-blob (or storage-r2)";

export async function uploadFile(
  file: File,
  opts?: { folder?: string },
): Promise<StoredFile> {
  void file;
  void opts;
  throw new Error(MISSING);
}
