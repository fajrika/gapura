"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  iuran,
  tagihan,
  transaksis,
  wargas,
} from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";

export type IuranActionState = {
  error?: string;
  success?: string;
};

async function assertManager() {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");
  return dbUser;
}

export async function generateTagihanAction(periode: string) {
  await assertManager();
  const re = /^\d{4}-\d{2}$/;
  if (!re.test(periode)) throw new Error("Periode tidak valid");

  const aktifIuran = await db.select().from(iuran).where(eq(iuran.aktif, true));
  const kkList = await db
    .select()
    .from(wargas)
    .where(eq(wargas.isKepalaKeluarga, true));

  for (const item of aktifIuran) {
    const existing = await db
      .select({ wargaId: tagihan.wargaId })
      .from(tagihan)
      .where(and(eq(tagihan.periode, periode), eq(tagihan.iuranId, item.id)));
    const existingIds = new Set(existing.map((e) => e.wargaId));

    const toInsert = kkList
      .filter((k) => !existingIds.has(k.id))
      .map((k) => ({
        iuranId: item.id,
        wargaId: k.id,
        periode,
        jumlah: item.jumlah,
        status: "belum" as const,
      }));

    if (toInsert.length > 0) {
      await db.insert(tagihan).values(toInsert);
    }
  }

  revalidatePath("/iuran");
  revalidatePath("/dashboard");
}

export async function bayarTagihanAction(
  id: number,
  metode: string,
  jumlah: string,
  wargaId: number,
) {
  await assertManager();

  await db
    .update(tagihan)
    .set({
      status: "lunas",
      tanggalBayar: new Date(),
      metode,
    })
    .where(eq(tagihan.id, id));

  const today = new Date().toISOString().slice(0, 10);
  await db.insert(transaksis).values({
    tipe: "masuk",
    kategori: "iuran",
    jumlah,
    keterangan: `Pembayaran iuran (tagihan #${id})`,
    wargaId,
    tanggal: today,
  });

  revalidatePath("/iuran");
  revalidatePath("/kas");
  revalidatePath("/dashboard");
}

export async function batalBayarTagihanAction(id: number) {
  await assertManager();
  await db
    .update(tagihan)
    .set({ status: "belum", tanggalBayar: null, metode: null })
    .where(eq(tagihan.id, id));
  revalidatePath("/iuran");
  revalidatePath("/kas");
}

const iuranSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  jumlah: z.string().min(1, "Jumlah wajib diisi"),
  hitungPer: z.enum(["kk", "jiwa"]),
});

export async function createIuranAction(
  _prev: IuranActionState,
  formData: FormData,
): Promise<IuranActionState> {
  await assertManager();
  const parsed = iuranSchema.safeParse({
    nama: formData.get("nama"),
    jumlah: formData.get("jumlah"),
    hitungPer: formData.get("hitungPer"),
  });
  if (!parsed.success) return { error: "Data iuran tidak valid" };

  await db.insert(iuran).values({
    nama: parsed.data.nama,
    jumlah: parsed.data.jumlah,
    hitungPer: parsed.data.hitungPer,
  });
  revalidatePath("/iuran");
  return { success: "Jenis iuran ditambahkan" };
}

export async function toggleIuranAction(id: number, aktif: boolean) {
  await assertManager();
  await db.update(iuran).set({ aktif }).where(eq(iuran.id, id));
  revalidatePath("/iuran");
}

const transaksiSchema = z.object({
  tipe: z.enum(["masuk", "keluar"]),
  kategori: z.string().min(1),
  jumlah: z.string().min(1),
  keterangan: z.string().optional(),
  tanggal: z.string().min(1),
  wargaId: z.string().optional(),
});

export async function createTransaksiAction(
  _prev: IuranActionState,
  formData: FormData,
): Promise<IuranActionState> {
  await assertManager();
  const parsed = transaksiSchema.safeParse({
    tipe: formData.get("tipe"),
    kategori: formData.get("kategori"),
    jumlah: formData.get("jumlah"),
    keterangan: formData.get("keterangan"),
    tanggal: formData.get("tanggal"),
    wargaId: formData.get("wargaId"),
  });
  if (!parsed.success) return { error: "Data transaksi tidak valid" };

  await db.insert(transaksis).values({
    tipe: parsed.data.tipe,
    kategori: parsed.data.kategori,
    jumlah: parsed.data.jumlah,
    keterangan: parsed.data.keterangan || null,
    tanggal: parsed.data.tanggal,
    wargaId: parsed.data.wargaId ? Number(parsed.data.wargaId) : null,
  });
  revalidatePath("/kas");
  revalidatePath("/dashboard");
  return { success: "Transaksi dicatat" };
}

export async function deleteTransaksiAction(id: number) {
  await assertManager();
  await db.delete(transaksis).where(eq(transaksis.id, id));
  revalidatePath("/kas");
  revalidatePath("/dashboard");
}
