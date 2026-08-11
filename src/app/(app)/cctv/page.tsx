import { headers } from "next/headers";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { cameras } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraForm } from "@/components/camera-form";
import { CameraPlayer } from "@/components/camera-player";
import { createCameraAction, deleteCameraAction, toggleCameraAction } from "@/lib/actions/camera";
import { Cctv, Plus, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CctvPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const rows = await db
    .select()
    .from(cameras)
    .orderBy(desc(cameras.enabled), cameras.nama);

  const host = (await headers()).get("host")?.split(":")[0] ?? "localhost";
  const go2rtcUrl = process.env.GO2RTC_URL ?? `http://${host}:1984`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Cctv className="size-5 text-emerald-600" /> CCTV
        </h1>
        <p className="text-sm text-slate-500">
          Pantau kamera keamanan (streaming via go2rtc)
        </p>
      </div>

      {rows.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-slate-500">
            Belum ada kamera terdaftar.
            {isManager && " Tambahkan kamera di bawah."}
          </CardContent>
        </Card>
      )}

      {rows.map((c) =>
        c.enabled ? (
          <CameraPlayer key={c.id} camera={c} go2rtcUrl={go2rtcUrl} />
        ) : (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {c.nama} — kamera dinonaktifkan
              </p>
              {isManager && (
                <form action={toggleCameraAction.bind(null, c.id, true)}>
                  <button className="text-xs font-semibold text-emerald-600">
                    Aktifkan
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        ),
      )}

      {isManager && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-4" /> Tambah Kamera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraForm action={createCameraAction} />
            </CardContent>
          </Card>

          {rows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kelola Kamera</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 p-0">
                {rows.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {c.nama}
                      </p>
                      <p className="truncate font-mono text-xs text-slate-400">
                        {c.rtspUrl}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {c.enabled && (
                        <form action={toggleCameraAction.bind(null, c.id, false)}>
                          <button className="text-xs text-slate-500">
                            Nonaktifkan
                          </button>
                        </form>
                      )}
                      <form action={deleteCameraAction.bind(null, c.id)}>
                        <button className="flex items-center gap-1 text-xs font-semibold text-red-600">
                          <Trash2 className="size-3.5" /> Hapus
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
