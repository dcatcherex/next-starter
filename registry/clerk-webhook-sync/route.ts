import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema/users";

export async function POST(req: NextRequest) {
  let evt;
  try {
    // Reads CLERK_WEBHOOK_SIGNING_SECRET automatically
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const u = evt.data;
    const primary =
      u.email_addresses.find((e) => e.id === u.primary_email_address_id) ??
      u.email_addresses[0];
    const values = {
      id: u.id,
      email: primary?.email_address ?? null,
      name: [u.first_name, u.last_name].filter(Boolean).join(" ") || null,
      imageUrl: u.image_url || null,
    };
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: values.email,
          name: values.name,
          imageUrl: values.imageUrl,
          updatedAt: new Date(),
        },
      });
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    await db.delete(users).where(eq(users.id, evt.data.id));
  }

  return new Response("OK", { status: 200 });
}
