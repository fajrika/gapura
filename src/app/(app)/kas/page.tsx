import Link from "next/link";
import { and, eq, gte, lt, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { transaksis, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDate, formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransaksiForm } from "@/components/transaksi-form";
import { DeleteTransaksiButton } from "@/components/delete-button";
import { deleteTransaksiAction } from "@/lib/actions/iuran";
import { Landmark, ArrowDownCircle, ArrowUpCircle, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KasPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const { month } = await searchParams;
  const now = new Date();
  const selMonth = month && /^\d{4}-\d{2}$/.test(month) ? month : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [masuk, keluar] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${transaksis.jumlah}),0)` })
      .from(transaksis)
      .where(eq(transaksis.tipe, "masuk")),
    db
      .select({ total: sql<number>`coalesce(sum(${transaksis.jumlah}),0)` })
      .from(transaksis)
      .where(eq(transaksis.tipe, "keluar")),
  ]);
  const saldo = Number(masuk[0]?.total ?? 0) - Number(keluar[0]?.total ?? 0);

  const [transaksiList, wargaList] = await Promise.all([
    db
      .select()
      .from(transaksis)
      .where(
        and(
          gte(transaksis.tanggal, `${selMonth}-01`),
          lt(transaksis.tanggal, `${nextMonth(selMonth)}-01`),
        ),
      )
      .orderBy(desc(transaksis.tanggal)),
    db.select().from(wargas).orderBy(wargas.nama),
  ]);
  const wargaById = new Map(wargaList.map((w) => [w.id, w]));

  const months = recentMonths(6);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kas RT</h1>
          <p className="text-sm text-slate-500">{selMonth}</p>
        </div>
        {isManager && (
          <Link href={`/kas/export?month=${selMonth}`}>
            <Button variant="secondary">
              <Download className="size-4" /> Export CSV
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {months.map((m) => (
          <Link
            key={m}
            href={`/kas?month=${m}`}
            className={
              selMonth === m
                ? "rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white"
                : "rounded-full bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm"
            }
          >
            {formatMonth(m)}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="min-w-0">
            <p className="text-xs text-slate-500">Saldo</p>
            <p className="break-words text-lg font-bold tabular-nums text-slate-900">{formatRupiah(saldo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="min-w-0">
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowUpCircle className="size-3.5 shrink-0 text-emerald-600" /> Pemasukan
            </p>
            <p className="break-words text-lg font-bold tabular-nums text-emerald-600">{formatRupiah(masuk[0]?.total ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="min-w-0">
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowDownCircle className="size-3.5 shrink-0 text-red-600" /> Pengeluaran
            </p>
            <p className="break-words text-lg font-bold tabular-nums text-red-600">{formatRupiah(keluar[0]?.total ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Catat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <TransaksiForm wargaList={wargaList} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="size-4" /> Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {transaksiList.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-500">
                Tidak ada transaksi bulan ini.
              </p>
            )}
            {transaksiList.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{t.kategori}</p>
                  <p className="truncate text-xs text-slate-400">
                    {t.keterangan ?? "-"}
                    {t.wargaId ? ` · ${wargaById.get(t.wargaId)?.nama ?? ""}` : ""}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(t.tanggal)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p
                    className={
                      t.tipe === "masuk"
                        ? "text-sm font-semibold text-emerald-600"
                        : "text-sm font-semibold text-red-600"
                    }
                  >
                    {t.tipe === "masuk" ? "+" : "-"}
                    {formatRupiah(t.jumlah)}
                  </p>
                  {isManager && (
                    <DeleteTransaksiButton id={t.id} action={deleteTransaksiAction} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function nextMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

function recentMonths(n: number) {
  const res: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    res.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return res;
}

function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${names[Number(m) - 1]} ${y}`;
}
