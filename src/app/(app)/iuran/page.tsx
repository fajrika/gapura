import Link from "next/link";
import { and, eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { iuran, tagihan, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { currentPeriode, formatPeriode, formatRupiah, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { BayarButton, BatalBayarButton } from "@/components/bayar-button";
import { GenerateTagihan, IuranForm, ToggleIuran } from "@/components/iuran-controls";
import { Wallet, FilePlus2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IuranPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { dbUser, user } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);
  const { periode } = await searchParams;
  const selPeriode = periode && /^\d{4}-\d{2}$/.test(periode) ? periode : currentPeriode();

  const [iuranList, wargaMap, periodeRows] = await Promise.all([
    db.select().from(iuran).orderBy(desc(iuran.aktif)),
    db.select().from(wargas),
    db
      .select({ periode: tagihan.periode })
      .from(tagihan)
      .groupBy(tagihan.periode)
      .orderBy(desc(tagihan.periode))
      .limit(12),
  ]);

  const wargaById = new Map(wargaMap.map((w) => [w.id, w]));

  let tagihanList: (typeof tagihan.$inferSelect)[];
  if (isManager) {
    const rows = await db
      .select({ t: tagihan })
      .from(tagihan)
      .innerJoin(wargas, eq(tagihan.wargaId, wargas.id))
      .where(eq(tagihan.periode, selPeriode))
      .orderBy(tagihan.status, wargas.noRumah);
    tagihanList = rows.map((r) => r.t);
  } else {
    tagihanList = dbUser.wargaId
      ? await db
          .select()
          .from(tagihan)
          .where(and(eq(tagihan.periode, selPeriode), eq(tagihan.wargaId, dbUser.wargaId)))
      : [];
  }

  const lunas = tagihanList.filter((t) => t.status === "lunas");
  const totalTagihan = tagihanList.reduce((a, t) => a + Number(t.jumlah), 0);
  const totalLunas = lunas.reduce((a, t) => a + Number(t.jumlah), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Iuran</h1>
          <p className="text-sm text-slate-500">{formatPeriode(selPeriode)}</p>
        </div>
        {isManager && <GenerateTagihan />}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/iuran"
          className={
            selPeriode === currentPeriode()
              ? "rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white"
              : "rounded-full bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm"
          }
        >
          Bulan ini
        </Link>
        {periodeRows.map((p) => (
          <Link
            key={p.periode}
            href={`/iuran?periode=${p.periode}`}
            className={
              selPeriode === p.periode
                ? "rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white"
                : "rounded-full bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm"
            }
          >
            {formatPeriode(p.periode)}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Total Tagihan</p>
            <p className="text-lg font-bold text-slate-900">{formatRupiah(totalTagihan)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Terkumpul / Tunggakan</p>
            <p className="text-lg font-bold text-emerald-600">{formatRupiah(totalLunas)}</p>
            <p className="text-xs text-red-600">{formatRupiah(totalTagihan - totalLunas)} tunggakan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-4" /> Daftar Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {tagihanList.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-500">
                {isManager
                  ? "Belum ada tagihan. Klik Generate untuk membuat tagihan bulan ini."
                  : "Tidak ada tagihan untuk periode ini."}
              </p>
            )}
            {tagihanList.map((t) => {
              const w = wargaById.get(t.wargaId);
              return (
                <div key={t.id} className="flex items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {w?.nama ?? "Warga"}
                      {isManager && <span className="ml-1 text-xs text-slate-400">Rmh {w?.noRumah ?? "-"}</span>}
                    </p>
                    <p className="text-xs text-slate-400">{formatRupiah(t.jumlah)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.status === "lunas" ? (
                      <>
                        <Badge variant="success">Lunas</Badge>
                        {isManager && <BatalBayarButton id={t.id} />}
                      </>
                    ) : (
                      <>
                        <Badge variant="danger">Belum</Badge>
                        {isManager && <BayarButton id={t.id} jumlah={t.jumlah} wargaId={t.wargaId} />}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Jenis Iuran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {iuranList.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{i.nama}</p>
                  <p className="text-xs text-slate-400">
                    {formatRupiah(i.jumlah)} / {i.hitungPer === "kk" ? "KK" : "jiwa"} · {i.periode}
                  </p>
                </div>
                <ToggleIuran id={i.id} aktif={i.aktif} />
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3">
              <IuranForm />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
