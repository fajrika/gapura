"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  kegiatans,
  kehadirans,
  arisans,
  arisanAnggota,
  arisanPencairan,
} from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { sendPushToAll } from "@/lib/push";

export type SosialActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function assertManager() {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");
  return dbUser;
}

const kegiatanSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  tempat: z.string().optional().or(z.literal("")),
  keterangan: z.string().optional().or(z.literal("")),
});

export async function createKegiatanAction(
  _prev: SosialActionState,
  formData: FormData,
): Promise<SosialActionState> {
  await assertManager();
  const parsed = kegiatanSchema.safeParse({
    judul: formData.get("judul"),
    tanggal: formData.get("tanggal"),
    tempat: formData.get("tempat"),
    keterangan: formData.get("keterangan"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(kegiatans).values({
    judul: parsed.data.judul,
    tanggal: parsed.data.tanggal,
    tempat: parsed.data.tempat || null,
    keterangan: parsed.data.keterangan || null,
  });

  await sendPushToAll({
    title: "Kegiatan Baru",
    body: parsed.data.judul,
    url: "/kegiatan",
  }).catch(() => {});

  revalidatePath("/kegiatan");
  return {};
}

export async function deleteKegiatanAction(id: number) {
  await assertManager();
  await db.delete(kegiatans).where(eq(kegiatans.id, id));
  revalidatePath("/kegiatan");
}

export async function presensiKegiatanAction(kegiatanId: number) {
  const { dbUser } = await requireAuth();
  if (!dbUser.wargaId) return;

  const existing = await db.query.kehadirans.findFirst({
    where: and(
      eq(kehadirans.kegiatanId, kegiatanId),
      eq(kehadirans.wargaId, dbUser.wargaId),
    ),
  });

  if (existing) {
    await db.delete(kehadirans).where(eq(kehadirans.id, existing.id));
  } else {
    await db.insert(kehadirans).values({
      kegiatanId,
      wargaId: dbUser.wargaId,
    });
  }
  revalidatePath("/kegiatan");
}

const arisanSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  iuran: z.string().min(1, "Iuran wajib diisi"),
});

export async function createArisanAction(
  _prev: SosialActionState,
  formData: FormData,
): Promise<SosialActionState> {
  await assertManager();
  const parsed = arisanSchema.safeParse({
    nama: formData.get("nama"),
    iuran: formData.get("iuran"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(arisans).values({
    nama: parsed.data.nama,
    iuran: parsed.data.iuran,
  });

  revalidatePath("/arisan");
  return {};
}

export async function tambahAnggotaArisanAction(
  arisanId: number,
  wargaId: number,
  urutan: number,
) {
  await assertManager();
  const existing = await db.query.arisanAnggota.findFirst({
    where: and(
      eq(arisanAnggota.arisanId, arisanId),
      eq(arisanAnggota.wargaId, wargaId),
    ),
  });
  if (!existing) {
    await db.insert(arisanAnggota).values({ arisanId, wargaId, urutan });
  } else {
    await db
      .update(arisanAnggota)
      .set({ urutan })
      .where(eq(arisanAnggota.id, existing.id));
  }
  revalidatePath("/arisan");
}

export async function hapusAnggotaArisanAction(id: number) {
  await assertManager();
  await db.delete(arisanAnggota).where(eq(arisanAnggota.id, id));
  revalidatePath("/arisan");
}

export async function setArisanStatusAction(
  id: number,
  field: "dibayar" | "dicairkan",
  value: boolean,
) {
  await assertManager();
  await db
    .update(arisanAnggota)
    .set({ [field]: value })
    .where(eq(arisanAnggota.id, id));
  revalidatePath("/arisan");
}

export async function catatPencairanAction(
  arisanId: number,
  wargaId: number,
  nominal: string,
  tanggal: string,
) {
  await assertManager();
  await db.insert(arisanPencairan).values({
    arisanId,
    wargaId,
    nominal,
    tanggal,
  });
  revalidatePath("/arisan");
}
