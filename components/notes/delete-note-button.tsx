"use client";

import { Trash2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteNote } from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";

export function DeleteNoteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Delete note"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await deleteNote(id);
          if (res.ok) toast.success("Note deleted");
          else toast.error(res.error);
        })
      }
    >
      <Trash2Icon />
    </Button>
  );
}
