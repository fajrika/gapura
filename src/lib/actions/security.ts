"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { securityCalls, users, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { sendPushToRole } from "@/lib/push";

// Warga/admin memanggil security → notif prioritas tinggi ke semua perangkat security
export async function callSecurityAction() {
  const { dbUser } = await requireAuth();

  let warga = null;
  if (dbUser.wargaId) {
    warga = await db.query.wargas.findFirst({
      where: eq(wargas.id, dbUser.wargaId),
    });
  }

  const call = await db
    .insert(securityCalls)
    .values({
      callerUserId: dbUser.id,
      callerWargaId: dbUser.wargaId ?? null,
    })
    .returning();

  const nama = warga?.nama ?? dbUser.name;
  const rumah = warga?.noRumah ? ` (Rumah ${warga.noRumah})` : "";

  await sendPushToRole("security", {
    title: "🚨 PANGGILAN SECURITY",
    body: `${nama}${rumah} meminta bantuan keamanan.`,
    url: "/security",
    kind: "security",
    urgency: "high",
    sound: true,
  });

  revalidatePath("/security");
  return { id: call[0].id };
}

// Security menyelesaikan panggilan
export async function resolveSecurityCallAction(id: number) {
  const { dbUser } = await requireAuth();
  const role = dbUser.role;
  if (role !== "security" && !isPengurusRole(role)) {
    throw new Error("Tidak punya akses");
  }

  await db
    .update(securityCalls)
    .set({
      status: "selesai",
      respondedByUserId: dbUser.id,
      selesaiAt: new Date(),
    })
    .where(eq(securityCalls.id, id));

  revalidatePath("/security");
}

export async function getSecurityUsersCount() {
  return db.query.users.findMany({ where: eq(users.role, "security") });
}
