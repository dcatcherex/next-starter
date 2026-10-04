import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  body: z.string().trim().max(10_000),
});

export type NoteInput = z.infer<typeof noteSchema>;
