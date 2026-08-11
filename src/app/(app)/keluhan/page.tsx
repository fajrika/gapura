import { desc } from "drizzle-orm";
import { db } from "@/db";
import { keluhans, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { KeluhanForm, UpdateKeluhan } from "@/components/laporan-forms";
import { deleteKeluhanAction } from "@/lib/actions/laporan";
import { DeleteGenericButton } from "@/components/action-buttons";
import { MessageSquareWarning } from "lucide-react";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "danger" | "warning" | "success"> = {
  baru: "danger",
  diproses: "warning",
  selesai: "success",
};

export default async function KeluhanPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const [wargaAll, rows] = await Promise.all([
    db.select().from(wargas),
    db.select().from(keluhans).orderBy(desc(keluhans.createdAt)),
  ]);
  const wargaById = new Map(wargaAll.map((w) => [w.id, w]));

  const list = isManager ? rows : rows.filter((k) => k.wargaId === dbUser.wargaId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Keluhan Warga</h1>
        <p className="text-sm text-slate-500">Sampaikan masalah di lingkungan kamu</p>
      </div>

      {!isManager && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Kirim Keluhan</h2>
            <KeluhanForm />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {list.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada keluhan.</p>
            </CardContent>
          </Card>
        )}
        {list.map((k) => {
          const w = wargaById.get(k.wargaId);
          return (
            <Card key={k.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquareWarning className="size-4 text-emerald-600" />
                    <h3 className="font-semibold text-slate-900">{k.kategori}</h3>
                    <Badge variant={statusVariant[k.status]}>{k.status}</Badge>
                  </div>
                  {isManager && (
                    <div className="flex items-center gap-1">
                      <UpdateKeluhan id={k.id} status={k.status} />
                      <DeleteGenericButton id={k.id} action={deleteKeluhanAction} label="keluhan" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">{k.isi}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>{w?.nama ?? "-"} · Rumah {w?.noRumah ?? "-"}</span>
                  <span>{formatDateTime(k.createdAt)}</span>
                  {k.catatan && <span className="text-emerald-700">Catatan: {k.catatan}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
