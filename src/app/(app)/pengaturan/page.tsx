import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PushSubscribe } from "@/components/pwa/push-subscribe";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  await requireAuth();
  const rows = await db.select().from(settings);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500">Info RT & preferensi notifikasi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Dapatkan pemberitahuan push untuk pengumuman baru, tagihan, dan
            jadwal ronda.
          </p>
          <PushSubscribe />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi RT/RW</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.key}>
                <dt className="text-xs text-slate-400">{r.key.replace(/_/g, " ")}</dt>
                <dd className="text-sm font-medium text-slate-800">{r.value ?? "-"}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
