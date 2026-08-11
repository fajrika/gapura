import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { kegiatans, kehadirans, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { KegiatanForm } from "@/components/sosial-forms";
import { createKegiatanAction, deleteKegiatanAction, presensiKegiatanAction } from "@/lib/actions/sosial";
import { DeleteGenericButton } from "@/components/action-buttons";
import { PresensiButton } from "@/components/sosial-forms";
import { PartyPopper, Check, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KegiatanPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const [kegiatanList, wargaAll] = await Promise.all([
    db.select().from(kegiatans).orderBy(asc(kegiatans.tanggal)),
    db.select().from(wargas),
  ]);
  const wargaById = new Map(wargaAll.map((w) => [w.id, w]));

  const hadirByKegiatan = new Map<number, Set<number>>();
  for (const k of kegiatanList) {
    const rows = await db
      .select()
      .from(kehadirans)
      .where(eq(kehadirans.kegiatanId, k.id));
    hadirByKegiatan.set(k.id, new Set(rows.map((r) => r.wargaId)));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Kegiatan</h1>
        <p className="text-sm text-slate-500">Acara & daftar hadir warga</p>
      </div>

      {isManager && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Buat Kegiatan</h2>
            <KegiatanForm action={createKegiatanAction} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {kegiatanList.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada kegiatan.</p>
            </CardContent>
          </Card>
        )}
        {kegiatanList.map((k) => {
          const hadir = hadirByKegiatan.get(k.id) ?? new Set();
          const sayaHadir = dbUser.wargaId ? hadir.has(dbUser.wargaId) : false;
          const hadirWarga = [...hadir].map((id) => wargaById.get(id)).filter(Boolean);
          return (
            <Card key={k.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="size-4 text-emerald-600" />
                    <h3 className="font-semibold text-slate-900">{k.judul}</h3>
                  </div>
                  {isManager && (
                    <DeleteGenericButton id={k.id} action={deleteKegiatanAction} label="kegiatan" />
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(k.tanggal)}
                  {k.tempat ? ` · ${k.tempat}` : ""}
                </p>
                {k.keterangan && <p className="mt-1 text-sm text-slate-600">{k.keterangan}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Users className="size-3.5" /> {hadir.size} hadir
                  </span>
                  {dbUser.wargaId && (
                    <PresensiButton
                      kegiatanId={k.id}
                      hadir={sayaHadir}
                      action={presensiKegiatanAction}
                    />
                  )}
                </div>
                {isManager && hadirWarga.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hadirWarga.map((w) => (
                      <span
                        key={w!.id}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                      >
                        <Check className="size-3" /> {w!.nama}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
