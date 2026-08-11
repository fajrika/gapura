import { desc } from "drizzle-orm";
import { db } from "@/db";
import { pengumumans } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { PengumumanForm } from "@/components/pengumuman-form";
import { createPengumumanAction, togglePinAction, deletePengumumanAction } from "@/lib/actions/pengumuman";
import { PinButton, DeleteGenericButton } from "@/components/action-buttons";
import { Pin, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PengumumanPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const list = await db
    .select()
    .from(pengumumans)
    .orderBy(desc(pengumumans.pinned), desc(pengumumans.createdAt));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengumuman</h1>
        <p className="text-sm text-slate-500">Berita & informasi untuk warga</p>
      </div>

      {isManager && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Buat Pengumuman Baru
            </h2>
            <PengumumanForm action={createPengumumanAction} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {list.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Belum ada pengumuman.</p>
            </CardContent>
          </Card>
        )}
        {list.map((p) => (
          <Card key={p.id} className={p.pinned ? "border-emerald-300" : ""}>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-4 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900">{p.judul}</h3>
                  {p.pinned && <Badge variant="info">Disematkan</Badge>}
                </div>
                {isManager && (
                  <div className="flex items-center gap-1">
                    <PinButton id={p.id} pinned={p.pinned} action={togglePinAction} />
                    <DeleteGenericButton id={p.id} action={deletePengumumanAction} />
                  </div>
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{p.isi}</p>
              <p className="mt-2 text-xs text-slate-400">
                {formatDateTime(p.createdAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
