import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  "mailto:admin@rtrw.local",
  vapidPublicKey,
  vapidPrivateKey,
);

export function getVapidPublicKey() {
  return vapidPublicKey;
}

export async function sendPushToUser(
  userId: number,
  payload: { title: string; body: string; url?: string },
) {
  const subs = await db.query.pushSubscriptions.findMany({
    where: (s, { eq }) => eq(s.userId, userId),
  });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
        },
        JSON.stringify(payload),
      ),
    ),
  );

  return results;
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  const subs = await db.select().from(pushSubscriptions);
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
        },
        JSON.stringify(payload),
      ),
    ),
  );
  return results;
}
