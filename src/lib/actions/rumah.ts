"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rumahs, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { generateVaForRumah } from "@/lib/payments";

export type RumahActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function assertManager() {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");
  return dbUser;
}

const rumahSchema = z.object({
  nomor: z.string().min(1, "Nomor rumah wajib diisi").max(20),
  blok: z.string().optional().or(z.literal("")),
  alamat: z.string().optional().or(z.literal("")),
});

export async function createRumahAction(
  _prev: RumahActionState,
  formData: FormData,
): Promise<RumahActionState> {
  await assertManager();

  const parsed = rumahSchema.safeParse({
    nomor: formData.get("nomor"),
    blok: formData.get("blok"),
    alamat: formData.get("alamat"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const existing = await db.query.rumahs.findFirst({
    where: eq(rumahs.nomor, parsed.data.nomor),
  });
  if (existing) return { error: `Rumah ${parsed.data.nomor} sudah ada` };

  const inserted = await db
    .insert(rumahs)
    .values({
      nomor: parsed.data.nomor,
      blok: parsed.data.blok || null,
      alamat: parsed.data.alamat || null,
    })
    .returning();

  const kepala = await db.query.wargas.findFirst({
    where: (w, { and, eq }) =>
      and(eq(w.noRumah, parsed.data.nomor), eq(w.isKepalaKeluarga, true)),
  });

  const vaNumber = await generateVaForRumah({
    rumahId: inserted[0].id,
    rumahNomor: parsed.data.nomor,
    namaKepalaKeluarga: kepala?.nama ?? "-",
  });
  await db
    .update(rumahs)
    .set({ vaNumber })
    .where(eq(rumahs.id, inserted[0].id));

  revalidatePath("/rumah");
  revalidatePath("/siteplan");
  redirect("/rumah");
}

export async function updateRumahAction(
  id: number,
  _prev: RumahActionState,
  formData: FormData,
): Promise<RumahActionState> {
  await assertManager();

  const parsed = rumahSchema.safeParse({
    nomor: formData.get("nomor"),
    blok: formData.get("blok"),
    alamat: formData.get("alamat"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  await db
    .update(rumahs)
    .set({
      nomor: parsed.data.nomor,
      blok: parsed.data.blok || null,
      alamat: parsed.data.alamat || null,
    })
    .where(eq(rumahs.id, id));

  revalidatePath("/rumah");
  revalidatePath(`/rumah/${id}`);
  revalidatePath("/siteplan");
  redirect("/rumah");
}

export async function deleteRumahAction(id: number) {
  await assertManager();
  await db.delete(rumahs).where(eq(rumahs.id, id));
  revalidatePath("/rumah");
  revalidatePath("/siteplan");
}

// Pasang posisi rumah di siteplan (persen dari lebar/tinggi peta)
export async function setRumahPositionAction(
  id: number,
  posX: number,
  posY: number,
) {
  await assertManager();
  const x = Math.min(100, Math.max(0, Math.round(posX * 100) / 100));
  const y = Math.min(100, Math.max(0, Math.round(posY * 100) / 100));
  await db.update(rumahs).set({ posX: String(x), posY: String(y) }).where(eq(rumahs.id, id));
  revalidatePath("/siteplan");
}

// Hubungkan warga ke rumah (dan sinkronkan noRumah)
export async function linkWargaToRumahAction(wargaId: number, rumahId: number | null) {
  await assertManager();
  const rumah = rumahId
    ? await db.query.rumahs.findFirst({ where: eq(rumahs.id, rumahId) })
    : null;
  await db
    .update(wargas)
    .set({ rumahId: rumahId, noRumah: rumah?.nomor ?? null })
    .where(eq(wargas.id, wargaId));
  revalidatePath("/warga");
  revalidatePath("/rumah");
  revalidatePath("/siteplan");
}
