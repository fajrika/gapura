import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { rumahs, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RumahForm } from "@/components/rumah-form";
import { createRumahAction } from "@/lib/actions/rumah";
import { Home, MapPin, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RumahListPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const rows = await db
    .select({
      rumah: rumahs,
      penghuni: count(wargas.id),
    })
    .from(rumahs)
    .leftJoin(wargas, eq(wargas.rumahId, rumahs.id))
    .groupBy(rumahs.id)
    .orderBy(rumahs.blok, rumahs.nomor);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Rumah</h1>
          <p className="text-sm text-slate-500">
            {rows.length} rumah terdaftar
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/siteplan">
            <Button variant="secondary">
              <MapPin className="size-4" /> Siteplan
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-slate-100 p-0">
          {rows.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500">
              Belum ada rumah. Tambahkan rumah pertama.
            </p>
          )}
          {rows.map(({ rumah, penghuni }) => (
            <Link
              key={rumah.id}
              href={`/rumah/${rumah.id}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Home className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    Rumah {rumah.nomor}
                  </p>
                  {rumah.blok && <Badge variant="neutral">Blok {rumah.blok}</Badge>}
                </div>
                <p className="text-xs text-slate-400">
                  {rumah.alamat || "Belum ada alamat"} · {penghuni} penghuni
                </p>
              </div>
              {rumah.vaNumber && (
                <Badge variant="info">VA {rumah.vaNumber}</Badge>
              )}
            </Link>
          ))}
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardContent>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Plus className="size-4" /> Tambah Rumah
            </p>
            <RumahForm action={createRumahAction} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
