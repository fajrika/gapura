"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  jadwalRundas,
  laporanKejadiians,
  keluhans,
  wargas,
} from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";

export type LaporanActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function assertManager() {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");
  return dbUser;
}

const dateStr = (d: Date) => d.toISOString().slice(0, 10);

export async function generateRondaAction(days: number) {
  await assertManager();
  const n = Math.min(Math.max(days, 1), 60);

  const kkList = await db
    .select()
    .from(wargas)
    .where(eq(wargas.isKepalaKeluarga, true))
    .orderBy(wargas.noRumah);

  if (kkList.length === 0) return;

  const start = new Date();
  const toInsert: { tanggal: string; wargaId: number; shift: string }[] = [];
  for (let i = 0; i < n; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const kk = kkList[i % kkList.length];
    toInsert.push({
      tanggal: dateStr(day),
      wargaId: kk.id,
      shift: i % 2 === 0 ? "Malam" : "Subuh",
    });
  }

  await db.insert(jadwalRundas).values(toInsert).onConflictDoNothing();
  revalidatePath("/ronda");
  revalidatePath("/dashboard");
}

export async function setStatusRondaAction(id: number, status: "hadir" | "tidak") {
  await assertManager();
  await db.update(jadwalRundas).set({ status }).where(eq(jadwalRundas.id, id));
  revalidatePath("/ronda");
  revalidatePath("/dashboard");
}

const kejadianSchema = z.object({
  tanggal: z.string().min(1),
  jam: z.string().optional().or(z.literal("")),
  jenis: z.string().min(1),
  isi: z.string().min(3, "Isi minimal 3 karakter"),
});

export async function laporKejadianAction(
  _prev: LaporanActionState,
  formData: FormData,
): Promise<LaporanActionState> {
  const { dbUser } = await requireAuth();

  const parsed = kejadianSchema.safeParse({
    tanggal: formData.get("tanggal"),
    jam: formData.get("jam"),
    jenis: formData.get("jenis"),
    isi: formData.get("isi"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(laporanKejadiians).values({
    tanggal: parsed.data.tanggal,
    jam: parsed.data.jam || null,
    jenis: parsed.data.jenis,
    isi: parsed.data.isi,
    wargaId: dbUser.wargaId ?? null,
  });

  revalidatePath("/kejadian");
  return {};
}

export async function updateKejadianAction(
  id: number,
  status: "ditangani" | "selesai",
  tindakLanjut: string,
) {
  await assertManager();
  await db
    .update(laporanKejadiians)
    .set({ status, tindakLanjut: tindakLanjut || null })
    .where(eq(laporanKejadiians.id, id));
  revalidatePath("/kejadian");
}

export async function deleteKejadianAction(id: number) {
  await assertManager();
  await db.delete(laporanKejadiians).where(eq(laporanKejadiians.id, id));
  revalidatePath("/kejadian");
}

const keluhanSchema = z.object({
  kategori: z.string().min(1),
  isi: z.string().min(3, "Isi minimal 3 karakter"),
});

export async function laporKeluhanAction(
  _prev: LaporanActionState,
  formData: FormData,
): Promise<LaporanActionState> {
  const { dbUser } = await requireAuth();
  if (!dbUser.wargaId) return { error: "Akun belum terhubung ke data warga" };

  const parsed = keluhanSchema.safeParse({
    kategori: formData.get("kategori"),
    isi: formData.get("isi"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(keluhans).values({
    wargaId: dbUser.wargaId,
    kategori: parsed.data.kategori,
    isi: parsed.data.isi,
  });

  revalidatePath("/keluhan");
  return {};
}

export async function updateKeluhanAction(
  id: number,
  status: "diproses" | "selesai",
  catatan: string,
) {
  await assertManager();
  await db
    .update(keluhans)
    .set({ status, catatan: catatan || null })
    .where(eq(keluhans.id, id));
  revalidatePath("/keluhan");
}

export async function deleteKeluhanAction(id: number) {
  await assertManager();
  await db.delete(keluhans).where(eq(keluhans.id, id));
  revalidatePath("/keluhan");
}
