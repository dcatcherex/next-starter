import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

import { DeleteNoteButton } from "@/components/notes/delete-note-button";
import { NoteForm } from "@/components/notes/note-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { notes } from "@/db/schema/notes";

export default async function NotesPage() {
  const { userId } = await auth.protect();
  const rows = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Notes</h1>
      <NoteForm />
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.length === 0 && (
          <p className="text-muted-foreground">No notes yet.</p>
        )}
        {rows.map((n) => (
          <Card key={n.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{n.title}</CardTitle>
              <DeleteNoteButton id={n.id} />
            </CardHeader>
            {n.body && <CardContent>{n.body}</CardContent>}
          </Card>
        ))}
      </div>
    </div>
  );
}
