"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { notes } from "@/db/schema/notes";

import { noteSchema } from "./schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createNote(input: unknown): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await db.insert(notes).values({ userId, ...parsed.data });
  revalidatePath("/notes");
  return { ok: true };
}

export async function deleteNote(id: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Invalid id" };

  await db
    .delete(notes)
    .where(and(eq(notes.id, parsedId.data), eq(notes.userId, userId)));
  revalidatePath("/notes");
  return { ok: true };
}
