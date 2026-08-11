"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pengumumans } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { sendPushToAll } from "@/lib/push";

const schema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  isi: z.string().min(3, "Isi minimal 3 karakter"),
  pinned: z.enum(["on", ""]).transform((v) => v === "on"),
});

export type PengumumanActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createPengumumanAction(
  _prev: PengumumanActionState,
  formData: FormData,
): Promise<PengumumanActionState> {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");

  const parsed = schema.safeParse({
    judul: formData.get("judul"),
    isi: formData.get("isi"),
    pinned: formData.get("pinned"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(pengumumans).values({
    judul: parsed.data.judul,
    isi: parsed.data.isi,
    authorId: dbUser.id,
    pinned: parsed.data.pinned,
  });

  await sendPushToAll({
    title: "Pengumuman Baru",
    body: parsed.data.judul,
    url: "/pengumuman",
  }).catch(() => {});

  revalidatePath("/pengumuman");
  revalidatePath("/dashboard");
  redirect("/pengumuman");
}

export async function togglePinAction(id: number, pinned: boolean) {
  await requireAuth();
  await db.update(pengumumans).set({ pinned }).where(eq(pengumumans.id, id));
  revalidatePath("/pengumuman");
  revalidatePath("/dashboard");
}

export async function deletePengumumanAction(id: number) {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");
  await db.delete(pengumumans).where(eq(pengumumans.id, id));
  revalidatePath("/pengumuman");
  revalidatePath("/dashboard");
}
