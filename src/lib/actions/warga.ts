"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";

const wargaSchema = z.object({
  nik: z.string().min(16, "NIK harus 16 digit").max(20),
  nkk: z.string().min(16, "NKK harus 16 digit").max(20).or(z.literal("")),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  jk: z.enum(["L", "P"]),
  tglLahir: z.string().optional().or(z.literal("")),
  agama: z.string().optional().or(z.literal("")),
  pekerjaan: z.string().optional().or(z.literal("")),
  statusTinggal: z.enum(["tetap", "kontrak", "sewa", "kos"]),
  noRumah: z.string().optional().or(z.literal("")),
  telepon: z.string().optional().or(z.literal("")),
  isKepalaKeluarga: z.enum(["on", ""]).transform((v) => v === "on"),
});

export type WargaActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function assertManager() {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) {
    throw new Error("Tidak punya akses");
  }
  return dbUser;
}

export async function createWargaAction(
  _prev: WargaActionState,
  formData: FormData,
): Promise<WargaActionState> {
  await assertManager();

  const parsed = wargaSchema.safeParse({
    nik: formData.get("nik"),
    nkk: formData.get("nkk"),
    nama: formData.get("nama"),
    jk: formData.get("jk"),
    tglLahir: formData.get("tglLahir"),
    agama: formData.get("agama"),
    pekerjaan: formData.get("pekerjaan"),
    statusTinggal: formData.get("statusTinggal"),
    noRumah: formData.get("noRumah"),
    telepon: formData.get("telepon"),
    isKepalaKeluarga: formData.get("isKepalaKeluarga"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const existing = await db.query.wargas.findFirst({
    where: eq(wargas.nik, parsed.data.nik),
  });
  if (existing) return { error: "NIK sudah terdaftar" };

  await db.insert(wargas).values({
    nik: parsed.data.nik,
    nkk: parsed.data.nkk || null,
    nama: parsed.data.nama,
    jk: parsed.data.jk,
    tglLahir: parsed.data.tglLahir || null,
    agama: parsed.data.agama || null,
    pekerjaan: parsed.data.pekerjaan || null,
    statusTinggal: parsed.data.statusTinggal,
    noRumah: parsed.data.noRumah || null,
    telepon: parsed.data.telepon || null,
    isKepalaKeluarga: parsed.data.isKepalaKeluarga,
  });

  revalidatePath("/warga");
  redirect("/warga");
}

export async function updateWargaAction(
  id: number,
  _prev: WargaActionState,
  formData: FormData,
): Promise<WargaActionState> {
  await assertManager();

  const parsed = wargaSchema.safeParse({
    nik: formData.get("nik"),
    nkk: formData.get("nkk"),
    nama: formData.get("nama"),
    jk: formData.get("jk"),
    tglLahir: formData.get("tglLahir"),
    agama: formData.get("agama"),
    pekerjaan: formData.get("pekerjaan"),
    statusTinggal: formData.get("statusTinggal"),
    noRumah: formData.get("noRumah"),
    telepon: formData.get("telepon"),
    isKepalaKeluarga: formData.get("isKepalaKeluarga"),
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
    .update(wargas)
    .set({
      nik: parsed.data.nik,
      nkk: parsed.data.nkk || null,
      nama: parsed.data.nama,
      jk: parsed.data.jk,
      tglLahir: parsed.data.tglLahir || null,
      agama: parsed.data.agama || null,
      pekerjaan: parsed.data.pekerjaan || null,
      statusTinggal: parsed.data.statusTinggal,
      noRumah: parsed.data.noRumah || null,
      telepon: parsed.data.telepon || null,
      isKepalaKeluarga: parsed.data.isKepalaKeluarga,
    })
    .where(eq(wargas.id, id));

  revalidatePath("/warga");
  revalidatePath(`/warga/${id}`);
  redirect("/warga");
}

export async function deleteWargaAction(id: number) {
  await assertManager();
  await db.delete(wargas).where(eq(wargas.id, id));
  revalidatePath("/warga");
}
