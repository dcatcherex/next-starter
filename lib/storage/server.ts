import "server-only";

const MISSING =
  "No storage provider installed. Run: pnpm dlx shadcn add @starter/storage-vercel-blob (or storage-r2)";

export async function getFileUrl(key: string): Promise<string> {
  void key;
  throw new Error(MISSING);
}

export async function deleteFile(key: string): Promise<void> {
  void key;
  throw new Error(MISSING);
}
