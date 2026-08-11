import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: Request) {
  const { dbUser } = await requireAuth();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }

  const existing = await db.query.pushSubscriptions.findFirst({
    where: (s, { eq }) => eq(s.endpoint, parsed.data.endpoint),
  });

  if (!existing) {
    await db.insert(pushSubscriptions).values({
      userId: dbUser.id,
      endpoint: parsed.data.endpoint,
      keysP256dh: parsed.data.keys.p256dh,
      keysAuth: parsed.data.keys.auth,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { dbUser } = await requireAuth();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (body?.endpoint) {
    await db
      .delete(pushSubscriptions)
      .where((s, { eq }) => eq(s.endpoint, body.endpoint));
  }

  return NextResponse.json({ ok: true });
}
