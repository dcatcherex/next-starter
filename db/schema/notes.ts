import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Clerk user id (no users table in the base)
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("notes_user_id_idx").on(t.userId)],
);

export type Note = typeof notes.$inferSelect;
