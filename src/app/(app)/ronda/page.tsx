import Link from "next/link";
import { asc, gte } from "drizzle-orm";
import { db } from "@/db";
import { jadwalRundas, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenerateRonda, RondaStatus } from "@/components/ronda-controls";
import { generateRondaAction } from "@/lib/actions/laporan";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RondaPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const [wargaAll, list] = await Promise.all([
    db.select().from(wargas),
    db
      .select()
      .from(jadwalRundas)
      .where(gte(jadwalRundas.tanggal, new Date().toISOString().slice(0, 10)))
      .orderBy(asc(jadwalRundas.tanggal))
      .limit(60),
  ]);
  const wargaById = new Map(wargaAll.map((w) => [w.id, w]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jadwal Ronda</h1>
          <p className="text-sm text-slate-500">Rotasi jaga malam per KK</p>
        </div>
        {isManager && <GenerateRonda />}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {list.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-500">
                Belum ada jadwal ronda. {isManager && "Klik Generate untuk membuat jadwal."}
              </p>
            )}
            {list.map((r) => {
              const w = wargaById.get(r.wargaId);
              const isMine = dbUser.wargaId === r.wargaId;
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between gap-2 px-4 py-3 ${isMine ? "bg-emerald-50/60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100">
                      <ShieldCheck className="size-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {formatDate(r.tanggal)}
                        {isMine && <Badge variant="info">Jadwal kamu</Badge>}
                      </p>
                      <p className="text-xs text-slate-400">
                        {r.shift} · {w?.nama ?? "-"} (Rmh {w?.noRumah ?? "-"})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={r.status === "hadir" ? "success" : r.status === "tidak" ? "danger" : "warning"}
                    >
                      {r.status}
                    </Badge>
                    {isManager && r.status === "menunggu" && (
                      <RondaStatus id={r.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {isManager && (
        <p className="text-xs text-slate-400">
          Terakhir {list.length} jadwal ke depan. Generate baru menambahkan tanpa duplikat.
        </p>
      )}
    </div>
  );
}
