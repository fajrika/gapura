import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? "";

function assertVapid() {
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error("VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY belum di-set");
  }
  webpush.setVapidDetails(
    "mailto:admin@gapura.local",
    vapidPublicKey,
    vapidPrivateKey,
  );
}

export function getVapidPublicKey() {
  return vapidPublicKey;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  kind?: "normal" | "security";
  urgency?: "very-low" | "low" | "normal" | "high";
  sound?: boolean;
}

const OPTIONS: webpush.RequestOptions = {
  TTL: 60 * 60 * 24,
};

function toWebpushOptions(payload: PushPayload): webpush.RequestOptions {
  const options: webpush.RequestOptions = { ...OPTIONS };
  if (payload.urgency) options.urgency = payload.urgency;
  return options;
}

async function sendToSubs(
  subs: { endpoint: string; keysP256dh: string; keysAuth: string }[],
  payload: PushPayload,
) {
  assertVapid();
  return Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
        },
        JSON.stringify(payload),
        toWebpushOptions(payload),
      ),
    ),
  );
}

export async function sendPushToUser(
  userId: number,
  payload: PushPayload,
) {
  const subs = await db.query.pushSubscriptions.findMany({
    where: (s, { eq }) => eq(s.userId, userId),
  });
  return sendToSubs(subs, payload);
}

export async function sendPushToRole(
  role: string,
  payload: PushPayload,
) {
  const userIds = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, role as typeof users.$inferSelect.role));
  const ids = new Set(userIds.map((u) => u.id));
  const subs = await db.select().from(pushSubscriptions);
  return sendToSubs(subs.filter((s) => s.userId !== null && ids.has(s.userId)), payload);
}

export async function sendPushToAll(payload: PushPayload) {
  const subs = await db.select().from(pushSubscriptions);
  return sendToSubs(subs, payload);
}
