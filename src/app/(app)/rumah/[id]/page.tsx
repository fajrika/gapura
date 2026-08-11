import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rumahs, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkWargaForm } from "@/components/link-warga-form";
import { deleteRumahAction } from "@/lib/actions/rumah";
import { Home, MapPin, Pencil, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RumahDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);
  const { id } = await params;

  const rumah = await db.query.rumahs.findFirst({
    where: eq(rumahs.id, Number(id)),
  });
  if (!rumah) notFound();

  const penghuni = await db
    .select()
    .from(wargas)
    .where(eq(wargas.rumahId, rumah.id))
    .orderBy(wargas.isKepalaKeluarga, wargas.nama);

  const semuaWarga = await db.select().from(wargas);
  const terhubungIds = new Set(
    (await db
      .select({ id: wargas.id })
      .from(wargas)
      .where(eq(wargas.rumahId, rumah.id))).map((w) => w.id),
  );
  const kandidat = semuaWarga.filter(
    (w) => !terhubungIds.has(w.id) || w.noRumah === rumah.nomor,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Home className="size-5 text-emerald-600" /> Rumah {rumah.nomor}
            {rumah.blok && (
              <Badge variant="neutral">Blok {rumah.blok}</Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500">{rumah.alamat || "-"}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/siteplan">
            <Button variant="secondary">
              <MapPin className="size-4" /> Lihat di Peta
            </Button>
          </Link>
          {isManager && (
            <>
              <Link href={`/rumah/${rumah.id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="size-4" /> Edit
                </Button>
              </Link>
              <form action={deleteRumahAction.bind(null, rumah.id)}>
                <Button variant="danger" type="submit">
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pembayaran (VA & QRIS)</CardTitle>
        </CardHeader>
        <CardContent>
          {rumah.vaNumber ? (
            <div>
              <p className="text-xs text-slate-400">Virtual Account unik rumah ini</p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-900">
                {rumah.vaNumber}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Nomor VA dibuat otomatis saat rumah ditambahkan dan digunakan
                untuk bayar IPL rumah ini. QRIS dinamis dibuat per tagihan di
                menu Iuran.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">VA belum dibuat.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penghuni ({penghuni.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 p-0">
          {penghuni.length === 0 && (
            <p className="p-4 text-sm text-slate-500">
              Belum ada penghuni terhubung.
            </p>
          )}
          {penghuni.map((w) => (
            <Link
              key={w.id}
              href={`/warga/${w.id}`}
              className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {w.nama} {w.isKepalaKeluarga && <Badge variant="info">KK</Badge>}
                </p>
                <p className="text-xs text-slate-400">{w.nik}</p>
              </div>
              <Badge variant={w.statusTinggal === "tetap" ? "success" : "warning"}>
                {w.statusTinggal}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Hubungkan Warga ke Rumah Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkWargaForm
              rumahId={rumah.id}
              wargaList={kandidat.map((w) => ({ id: w.id, nama: w.nama, noRumah: w.noRumah }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
