import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { arisans, arisanAnggota, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArisanForm, TambahAnggota, ArisanStatus } from "@/components/arisan-controls";
import { createArisanAction } from "@/lib/actions/sosial";
import { PiggyBank } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArisanPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const [arisanList, wargaAll] = await Promise.all([
    db.select().from(arisans).orderBy(desc(arisans.createdAt)),
    db.select().from(wargas),
  ]);
  const wargaById = new Map(wargaAll.map((w) => [w.id, w]));

  const anggotaByArisan = new Map<number, typeof arisanAnggota.$inferSelect[]>();
  for (const a of arisanList) {
    const rows = await db
      .select()
      .from(arisanAnggota)
      .where(eq(arisanAnggota.arisanId, a.id))
      .orderBy(arisanAnggota.urutan);
    anggotaByArisan.set(a.id, rows);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Arisan Warga</h1>
        <p className="text-sm text-slate-500">Kelola arisan, iuran, & urutan pencairan</p>
      </div>

      {isManager && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Buat Arisan</h2>
            <ArisanForm action={createArisanAction} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {arisanList.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada arisan.</p>
            </CardContent>
          </Card>
        )}
        {arisanList.map((a) => {
          const anggota = anggotaByArisan.get(a.id) ?? [];
          const total = anggota.length * Number(a.iuran);
          return (
            <Card key={a.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="size-4 text-emerald-600" />
                    <h3 className="font-semibold text-slate-900">{a.nama}</h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Iuran {formatRupiah(a.iuran)}/bulan · {anggota.length} anggota · Total {formatRupiah(total)}
                  </span>
                </div>

                <div className="mt-3 divide-y divide-slate-100">
                  {anggota.length === 0 && (
                    <p className="py-2 text-sm text-slate-500">Belum ada anggota.</p>
                  )}
                  {anggota.map((m) => {
                    const w = wargaById.get(m.wargaId);
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-2 py-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            {m.urutan}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{w?.nama ?? "-"}</p>
                            <p className="text-xs text-slate-400">Rmh {w?.noRumah ?? "-"}</p>
                          </div>
                        </div>
                        {isManager ? (
                          <ArisanStatus
                            id={m.id}
                            dibayar={m.dibayar}
                            dicairkan={m.dicairkan}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            {m.dibayar ? "Dibayar" : "Belum bayar"}
                            {m.dicairkan ? " · Dicairkan" : ""}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isManager && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <TambahAnggota arisanId={a.id} wargaList={wargaAll} />
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
