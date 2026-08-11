import { asc } from "drizzle-orm";
import { db } from "@/db";
import { agendas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AgendaForm } from "@/components/agenda-form";
import { createAgendaAction, deleteAgendaAction } from "@/lib/actions/agenda";
import { DeleteGenericButton } from "@/components/action-buttons";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const list = await db
    .select()
    .from(agendas)
    .orderBy(asc(agendas.tanggal));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Agenda</h1>
        <p className="text-sm text-slate-500">Jadwal kegiatan & rapat warga</p>
      </div>

      {isManager && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Tambah Agenda
            </h2>
            <AgendaForm action={createAgendaAction} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {list.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada agenda.</p>
            </CardContent>
          </Card>
        )}
        {list.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <span className="text-sm font-bold">
                    {formatDate(a.tanggal).split(" ")[0]}
                  </span>
                  <span className="text-[10px]">{formatDate(a.tanggal).split(" ")[1]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-emerald-600" />
                    <h3 className="font-semibold text-slate-900">{a.judul}</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    {a.jam ? `${a.jam} WIB` : ""}
                    {a.tempat ? ` · ${a.tempat}` : ""}
                  </p>
                  {a.keterangan && (
                    <p className="mt-1 text-sm text-slate-600">{a.keterangan}</p>
                  )}
                </div>
              </div>
              {isManager && <DeleteGenericButton id={a.id} action={deleteAgendaAction} label="agenda" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
