"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { agendas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";

const schema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jam: z.string().optional().or(z.literal("")),
  tempat: z.string().optional().or(z.literal("")),
  keterangan: z.string().optional().or(z.literal("")),
});

export type AgendaActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createAgendaAction(
  _prev: AgendaActionState,
  formData: FormData,
): Promise<AgendaActionState> {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");

  const parsed = schema.safeParse({
    judul: formData.get("judul"),
    tanggal: formData.get("tanggal"),
    jam: formData.get("jam"),
    tempat: formData.get("tempat"),
    keterangan: formData.get("keterangan"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(agendas).values({
    judul: parsed.data.judul,
    tanggal: parsed.data.tanggal,
    jam: parsed.data.jam || null,
    tempat: parsed.data.tempat || null,
    keterangan: parsed.data.keterangan || null,
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  redirect("/agenda");
}

export async function deleteAgendaAction(id: number) {
  await requireAuth();
  await db.delete(agendas).where(eq(agendas.id, id));
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}
