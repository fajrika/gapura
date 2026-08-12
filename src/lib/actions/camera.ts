"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cameras } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { syncGo2rtcStreams } from "@/lib/go2rtc";

export type CameraActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function assertManager() {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");
  return dbUser;
}

const cameraSchema = z.object({
  nama: z.string().min(2, "Nama kamera minimal 2 karakter"),
  lokasi: z.string().optional().or(z.literal("")),
  rtspUrl: z.string().min(5, "URL RTSP wajib diisi"),
  onvifHost: z.string().optional().or(z.literal("")),
  onvifPort: z.coerce.number().int().min(1).max(65535).default(8000),
  onvifUsername: z.string().optional().or(z.literal("")),
  onvifPassword: z.string().optional().or(z.literal("")),
});

export async function createCameraAction(
  _prev: CameraActionState,
  formData: FormData,
): Promise<CameraActionState> {
  await assertManager();

  const parsed = cameraSchema.safeParse({
    nama: formData.get("nama"),
    lokasi: formData.get("lokasi"),
    rtspUrl: formData.get("rtspUrl"),
    onvifHost: formData.get("onvifHost"),
    onvifPort: formData.get("onvifPort") || 8000,
    onvifUsername: formData.get("onvifUsername"),
    onvifPassword: formData.get("onvifPassword"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  await db.insert(cameras).values({
    nama: parsed.data.nama,
    lokasi: parsed.data.lokasi || null,
    rtspUrl: parsed.data.rtspUrl,
    onvifHost: parsed.data.onvifHost || null,
    onvifPort: parsed.data.onvifPort,
    onvifUsername: parsed.data.onvifUsername || null,
    onvifPassword: parsed.data.onvifPassword || null,
  });

  syncGo2rtcStreams().catch(() => {});
  revalidatePath("/cctv");
  return { error: undefined };
}

export async function deleteCameraAction(id: number) {
  await assertManager();
  await db.delete(cameras).where(eq(cameras.id, id));
  syncGo2rtcStreams().catch(() => {});
  revalidatePath("/cctv");
}

export async function toggleCameraAction(id: number, enabled: boolean) {
  await assertManager();
  await db.update(cameras).set({ enabled }).where(eq(cameras.id, id));
  syncGo2rtcStreams().catch(() => {});
  revalidatePath("/cctv");
}
