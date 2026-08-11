import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  agendas,
  jadwalRundas,
  pengumumans,
  settings,
  tagihan,
  transaksis,
  wargas,
} from "@/db/schema";
import { getSession, isPengurusRole } from "@/lib/auth";
import { currentPeriode, formatDate, formatPeriode, formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) notFound();
  const isPengurus = isPengurusRole(session.role);

  const [settingsRows, wargaAll, pengumumanList, agendaList, rondaList] =
    await Promise.all([
      db.select().from(settings),
      db.select().from(wargas),
      db.select().from(pengumumans).orderBy(desc(pengumumans.pinned), desc(pengumumans.createdAt)).limit(5),
      db.select().from(agendas).orderBy(agendas.tanggal).limit(5),
      db.select().from(jadwalRundas).where(gte(jadwalRundas.tanggal, new Date().toISOString().slice(0, 10))).orderBy(jadwalRundas.tanggal).limit(5),
    ]);

  const getSetting = (key: string) =>
    settingsRows.find((s) => s.key === key)?.value ?? "";

  const periode = currentPeriode();

  const [kasMasuk, kasKeluar, tagihanPeriode] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${transaksis.jumlah}),0)` })
      .from(transaksis)
      .where(eq(transaksis.tipe, "masuk")),
    db
      .select({ total: sql<number>`coalesce(sum(${transaksis.jumlah}),0)` })
      .from(transaksis)
      .where(eq(transaksis.tipe, "keluar")),
    db
      .select({ total: sql<number>`coalesce(sum(${tagihan.jumlah}),0)` })
      .from(tagihan)
      .where(and(eq(tagihan.periode, periode), eq(tagihan.status, "belum"))),
  ]);

  const saldo = Number(kasMasuk[0]?.total ?? 0) - Number(kasKeluar[0]?.total ?? 0);

  let myTagihan: typeof tagihan.$inferSelect[] = [];
  if (session.role === "warga") {
    const dbUser = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, Number(session.sub)) });
    if (dbUser?.wargaId) {
      myTagihan = await db
        .select()
        .from(tagihan)
        .where(and(eq(tagihan.wargaId, dbUser.wargaId), eq(tagihan.status, "belum")))
        .orderBy(desc(tagihan.periode));
    }
  }

  const kkCount = wargaAll.filter((w) => w.isKepalaKeluarga).length;
  const statCards = isPengurus
    ? [
        { label: "Jumlah KK", value: String(kkCount), href: "/warga" },
        { label: "Jumlah Warga", value: String(wargaAll.length), href: "/warga" },
        { label: "Saldo Kas", value: formatRupiah(saldo), href: "/kas" },
        { label: "Iuran Bulan Ini", value: formatRupiah(tagihanPeriode[0]?.total ?? 0), href: "/iuran" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Halo, {session.name}
        </h1>
        <p className="text-sm text-slate-500">
          {getSetting("nama_rt")} / {getSetting("nama_rw")}, {getSetting("kelurahan")}, {getSetting("kota")}
        </p>
      </div>

      {statCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((c) => (
            <Link key={c.label} href={c.href}>
              <Card className="transition hover:border-emerald-300">
                <CardContent>
                  <p className="text-xs text-slate-500">{c.label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{c.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {session.role === "warga" && (
        <Card>
          <CardHeader>
            <CardTitle>Tagihan Saya</CardTitle>
            <Link href="/iuran" className="text-xs font-medium text-emerald-600">
              Lihat semua
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {myTagihan.length === 0 && (
              <p className="text-sm text-slate-500">Tidak ada tagihan yang belum dibayar.</p>
            )}
            {myTagihan.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{formatPeriode(t.periode)}</p>
                  <p className="text-xs text-slate-400">Iuran bulanan</p>
                </div>
                <Badge variant="warning">{formatRupiah(t.jumlah)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pengumuman</CardTitle>
          <Link href="/pengumuman" className="text-xs font-medium text-emerald-600">
            Lihat semua
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {pengumumanList.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada pengumuman.</p>
          )}
          {pengumumanList.map((p) => (
            <div key={p.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                {p.pinned && <Badge variant="info">Disematkan</Badge>}
                <h3 className="text-sm font-semibold text-slate-900">{p.judul}</h3>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.isi}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDate(p.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agenda Terdekat</CardTitle>
            <Link href="/agenda" className="text-xs font-medium text-emerald-600">
              Semua
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {agendaList.length === 0 && (
              <p className="text-sm text-slate-500">Tidak ada agenda.</p>
            )}
            {agendaList.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <span className="text-xs font-bold">{formatDate(a.tanggal).split(" ")[0]}</span>
                  <span className="text-[10px]">{formatDate(a.tanggal).split(" ")[1]}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{a.judul}</p>
                  <p className="text-xs text-slate-400">
                    {a.jam ? `${a.jam} WIB` : ""} {a.tempat ? `· ${a.tempat}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jadwal Ronda</CardTitle>
            <Link href="/ronda" className="text-xs font-medium text-emerald-600">
              Semua
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {rondaList.length === 0 && (
              <p className="text-sm text-slate-500">Tidak ada jadwal ronda.</p>
            )}
            {rondaList.slice(0, 3).map((r) => {
              const warga = wargaAll.find((w) => w.id === r.wargaId);
              return (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{formatDate(r.tanggal)}</p>
                    <p className="text-xs text-slate-400">{r.shift} · Rumah {warga?.noRumah ?? "-"}</p>
                  </div>
                  <Badge variant={r.status === "menunggu" ? "warning" : "success"}>
                    {r.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
