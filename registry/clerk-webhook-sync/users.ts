import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Mirror of Clerk users, kept in sync by /api/webhooks/clerk. */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email"),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
