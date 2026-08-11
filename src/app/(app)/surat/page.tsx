import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { suratPengajuans, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDateTime, formatDate } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { AjukanSuratForm } from "@/components/surat-form";
import { ajukanSuratAction, deleteSuratAction } from "@/lib/actions/surat";
import { SetStatusSurat } from "@/components/surat-status";
import { DeleteGenericButton } from "@/components/action-buttons";
import { FileText, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "warning" | "success" | "danger" | "info"> = {
  pending: "warning",
  disetujui: "success",
  ditolak: "danger",
  selesai: "info",
};

export default async function SuratPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const [wargaAll, rows] = await Promise.all([
    db.select().from(wargas),
    db
      .select()
      .from(suratPengajuans)
      .orderBy(desc(suratPengajuans.createdAt)),
  ]);
  const wargaById = new Map(wargaAll.map((w) => [w.id, w]));

  const list = isManager
    ? rows
    : rows.filter((s) => s.wargaId === dbUser.wargaId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengajuan Surat</h1>
        <p className="text-sm text-slate-500">Ajukan & pantau status surat</p>
      </div>

      {!isManager && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Ajukan Surat Baru
            </h2>
            <AjukanSuratForm action={ajukanSuratAction} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {list.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada pengajuan surat.</p>
            </CardContent>
          </Card>
        )}
        {list.map((s) => {
          const w = wargaById.get(s.wargaId);
          return (
            <Card key={s.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-emerald-600" />
                    <h3 className="font-semibold text-slate-900">{s.jenis}</h3>
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  </div>
                  {isManager && (
                    <div className="flex items-center gap-1">
                      <SetStatusSurat id={s.id} status={s.status} />
                      <DeleteGenericButton
                        id={s.id}
                        action={deleteSuratAction}
                        label="pengajuan"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">{s.keperluan}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>
                    {w?.nama ?? "-"} · Rumah {w?.noRumah ?? "-"}
                  </span>
                  <span>{formatDateTime(s.createdAt)}</span>
                  {s.noSurat && <span className="font-medium text-slate-600">No. {s.noSurat}</span>}
                  {s.catatan && <span className="text-amber-600">Catatan: {s.catatan}</span>}
                </div>
                {(s.status === "disetujui" || s.status === "selesai") && (
                  <Link
                    href={`/surat/${s.id}/pdf`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                    target="_blank"
                  >
                    <Download className="size-3.5" /> Unduh PDF
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
