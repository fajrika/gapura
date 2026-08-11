import { desc } from "drizzle-orm";
import { db } from "@/db";
import { laporanKejadiians, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { KejadianForm, UpdateKejadian } from "@/components/laporan-forms";
import { deleteKejadianAction } from "@/lib/actions/laporan";
import { DeleteGenericButton } from "@/components/action-buttons";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "danger" | "warning" | "success"> = {
  baru: "danger",
  ditangani: "warning",
  selesai: "success",
};

export default async function KejadianPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const [wargaAll, list] = await Promise.all([
    db.select().from(wargas),
    db.select().from(laporanKejadiians).orderBy(desc(laporanKejadiians.createdAt)),
  ]);
  const wargaById = new Map(wargaAll.map((w) => [w.id, w.nama]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Laporan Kejadian</h1>
        <p className="text-sm text-slate-500">Buku siskamling & kejadian di lingkungan</p>
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Laporkan Kejadian</h2>
          <KejadianForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {list.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada laporan kejadian.</p>
            </CardContent>
          </Card>
        )}
        {list.map((k) => (
          <Card key={k.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-4 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900">{k.jenis}</h3>
                  <Badge variant={statusVariant[k.status]}>{k.status}</Badge>
                </div>
                {isManager && (
                  <div className="flex items-center gap-1">
                    <UpdateKejadian id={k.id} status={k.status} />
                    <DeleteGenericButton id={k.id} action={deleteKejadianAction} label="laporan" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">{k.isi}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>{formatDate(k.tanggal)}{k.jam ? ` · ${k.jam}` : ""}</span>
                <span>Pelapor: {k.wargaId ? wargaById.get(k.wargaId) ?? "-" : "-"}</span>
                {k.tindakLanjut && (
                  <span className="text-emerald-700">Tindak lanjut: {k.tindakLanjut}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
