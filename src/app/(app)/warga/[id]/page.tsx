import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteWargaButton } from "@/components/delete-button";
import { deleteWargaAction } from "@/lib/actions/warga";
import { UserRound, Pencil, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WargaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);
  const { id } = await params;
  const wargaId = Number(id);

  const warga = await db.query.wargas.findFirst({
    where: eq(wargas.id, wargaId),
  });
  if (!warga) notFound();

  const keluarga = warga.nkk
    ? await db
        .select()
        .from(wargas)
        .where(eq(wargas.nkk, warga.nkk))
        .orderBy(wargas.isKepalaKeluarga)
      : [];

  const rows: [string, string][] = [
    ["NIK", warga.nik],
    ["No. KK", warga.nkk ?? "-"],
    ["Jenis Kelamin", warga.jk === "L" ? "Laki-laki" : "Perempuan"],
    ["Tanggal Lahir", warga.tglLahir ? formatDate(warga.tglLahir) : "-"],
    ["Agama", warga.agama ?? "-"],
    ["Pekerjaan", warga.pekerjaan ?? "-"],
    ["Status Tinggal", warga.statusTinggal],
    ["No. Rumah", warga.noRumah ?? "-"],
    ["No. HP", warga.telepon ?? "-"],
    ["Kepala Keluarga", warga.isKepalaKeluarga ? "Ya" : "Tidak"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <UserRound className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{warga.nama}</h1>
            <p className="text-sm text-slate-500">
              Rumah {warga.noRumah ?? "-"} · {warga.statusTinggal}
            </p>
          </div>
        </div>
        {isManager && (
          <Link href={`/warga/${warga.id}/edit`}>
            <Button variant="secondary">
              <Pencil className="size-4" /> Edit
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Data</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="text-sm font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {keluarga.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" /> Anggota Keluarga
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {keluarga.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {k.nama}
                    {k.id === warga.id && (
                      <span className="ml-2 text-xs text-slate-400">(ini)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{k.nik}</p>
                </div>
                <div className="flex items-center gap-2">
                  {k.isKepalaKeluarga && <Badge variant="info">KK</Badge>}
                  <Link
                    href={`/warga/${k.id}`}
                    className="text-xs font-medium text-emerald-600"
                  >
                    Lihat
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isManager && (
        <div className="flex justify-end">
          <DeleteWargaButton
            id={warga.id}
            nama={warga.nama}
            action={deleteWargaAction}
          />
        </div>
      )}
    </div>
  );
}
