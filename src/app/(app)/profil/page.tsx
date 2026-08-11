import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { wargas } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const { dbUser } = await requireAuth();
  let warga = null;
  if (dbUser.wargaId) {
    warga = await db.query.wargas.findFirst({
      where: eq(wargas.id, dbUser.wargaId),
    });
  }

  const infoRows = [
    ["Nama", dbUser.name],
    ["Email", dbUser.email],
    ["No. HP", dbUser.phone ?? "-"],
    ["Role", dbUser.role],
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Profil Saya</h1>

      <Card>
        <CardHeader>
          <CardTitle>Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserRound className="size-7" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{dbUser.name}</p>
              <Badge variant="info">{dbUser.role}</Badge>
            </div>
          </div>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {infoRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="text-sm font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {warga ? (
        <Card>
          <CardHeader>
            <CardTitle>Data Warga</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ["Nama", warga.nama],
                ["NIK", warga.nik],
                ["No. KK", warga.nkk ?? "-"],
                ["Tanggal Lahir", warga.tglLahir ? formatDate(warga.tglLahir) : "-"],
                ["Pekerjaan", warga.pekerjaan ?? "-"],
                ["Status Tinggal", warga.statusTinggal],
                ["No. Rumah", warga.noRumah ?? "-"],
                ["Telepon", warga.telepon ?? "-"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="text-sm font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">
              Akun ini belum terhubung ke data warga. Hubungi pengurus RT untuk
              menghubungkan NIK kamu.
            </p>
          </CardContent>
        </Card>
      )}

      <form action={logoutAction}>
        <Button variant="danger" type="submit" className="w-full">
          Keluar
        </Button>
      </form>
    </div>
  );
}
