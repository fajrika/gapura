import Link from "next/link";
import { ilike, or, desc } from "drizzle-orm";
import { db } from "@/db";
import { wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WargaListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);
  const { q = "" } = await searchParams;

  let wargaList;
  if (q.trim()) {
    wargaList = await db
      .select()
      .from(wargas)
      .where(
        or(
          ilike(wargas.nama, `%${q}%`),
          ilike(wargas.nik, `%${q}%`),
          ilike(wargas.nkk, `%${q}%`),
          ilike(wargas.noRumah, `%${q}%`),
        ),
      )
      .orderBy(desc(wargas.createdAt));
  } else {
    wargaList = await db
      .select()
      .from(wargas)
      .orderBy(wargas.noRumah, wargas.nama);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Warga</h1>
          <p className="text-sm text-slate-500">{wargaList.length} orang terdaftar</p>
        </div>
        {isManager && (
          <Link href="/warga/new">
            <Button>
              <Plus className="size-4" /> Tambah
            </Button>
          </Link>
        )}
      </div>

      <form method="get" action="/warga" className="flex gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Cari nama, NIK, no. rumah..."
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          <Search className="size-4" /> Cari
        </Button>
      </form>

      <Card>
        <CardContent className="divide-y divide-slate-100 p-0">
          {wargaList.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500">
              Tidak ada warga ditemukan.
            </p>
          )}
          {wargaList.map((w) => (
            <Link
              key={w.id}
              href={`/warga/${w.id}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {w.nama}
                  </p>
                  {w.isKepalaKeluarga && <Badge variant="info">KK</Badge>}
                </div>
                <p className="text-xs text-slate-400">
                  Rumah {w.noRumah ?? "-"} · {w.nik}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={w.statusTinggal === "tetap" ? "success" : "warning"}>
                  {w.statusTinggal}
                </Badge>
                <p className="mt-1 text-xs text-slate-400">
                  {w.tglLahir ? formatDate(w.tglLahir) : "-"}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
