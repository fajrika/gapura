"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { suratPengajuans, settings, users } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";

const ajukanSchema = z.object({
  jenis: z.string().min(3, "Jenis surat minimal 3 karakter"),
  keperluan: z.string().min(3, "Keperluan minimal 3 karakter"),
});

export type SuratActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function ajukanSuratAction(
  _prev: SuratActionState,
  formData: FormData,
): Promise<SuratActionState> {
  const { dbUser } = await requireAuth();
  if (!dbUser.wargaId) return { error: "Akun belum terhubung ke data warga" };

  const parsed = ajukanSchema.safeParse({
    jenis: formData.get("jenis"),
    keperluan: formData.get("keperluan"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(suratPengajuans).values({
    wargaId: dbUser.wargaId,
    jenis: parsed.data.jenis,
    keperluan: parsed.data.keperluan,
  });

  revalidatePath("/surat");
  return { error: undefined };
}

export async function setStatusSuratAction(
  id: number,
  status: "disetujui" | "ditolak" | "selesai",
  catatan?: string,
) {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");

  const surat = await db.query.suratPengajuans.findFirst({
    where: eq(suratPengajuans.id, id),
  });
  if (!surat) return;

  let noSurat = surat.noSurat;
  if (status === "disetujui" && !noSurat) {
    const year = new Date().getFullYear();
    const counterKey = `surat_counter_${year}`;
    const counterRow = await db.query.settings.findFirst({
      where: eq(settings.key, counterKey),
    });
    const next = (Number(counterRow?.value ?? 0) + 1).toString().padStart(3, "0");

    const rtName = (
      (await db.query.settings.findFirst({ where: eq(settings.key, "nama_rt") }))
        ?.value ?? "RT"
    ).replace(/\s+/g, "-");
    const monthRoman = [
      "I", "II", "III", "IV", "V", "VI",
      "VII", "VIII", "IX", "X", "XI", "XII",
    ][new Date().getMonth()];

    noSurat = `${next}/${rtName}/${monthRoman}/${year}`;

    await db
      .insert(settings)
      .values({ key: counterKey, value: String(Number(counterRow?.value ?? 0) + 1) })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(Number(counterRow?.value ?? 0) + 1) },
      });
  }

  await db
    .update(suratPengajuans)
    .set({ status, noSurat, catatan: catatan ?? surat.catatan })
    .where(eq(suratPengajuans.id, id));

  revalidatePath("/surat");
}

export async function deleteSuratAction(id: number) {
  await requireAuth();
  await db.delete(suratPengajuans).where(eq(suratPengajuans.id, id));
  revalidatePath("/surat");
}
