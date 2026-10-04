"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createNote } from "@/app/(app)/notes/actions";
import { type NoteInput, noteSchema } from "@/app/(app)/notes/schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function NoteForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: "", body: "" },
  });

  function onSubmit(values: NoteInput) {
    startTransition(async () => {
      const res = await createNote(values);
      if (res.ok) {
        toast.success("Note created");
        form.reset();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md">
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="note-title">Title</FieldLabel>
              <Input
                {...field}
                id="note-title"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="body"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="note-body">Body</FieldLabel>
              <Input
                {...field}
                id="note-body"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={pending}>
          Add note
        </Button>
      </FieldGroup>
    </form>
  );
}
