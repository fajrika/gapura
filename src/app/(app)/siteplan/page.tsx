import { eq, count } from "drizzle-orm";
import { db } from "@/db";
import { rumahs, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { SiteplanCanvas } from "@/components/siteplan-canvas";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SiteplanPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);

  const rows = await db
    .select({ rumah: rumahs, jumlah: count(wargas.id) })
    .from(rumahs)
    .leftJoin(wargas, eq(wargas.rumahId, rumahs.id))
    .groupBy(rumahs.id)
    .orderBy(rumahs.blok, rumahs.nomor);

  const wargaList = await db.select().from(wargas);
  const byRumah = new Map<number, string[]>();
  for (const w of wargaList) {
    if (!w.rumahId) continue;
    const list = byRumah.get(w.rumahId) ?? [];
    if (list.length < 3) list.push(w.isKepalaKeluarga ? `${w.nama} (KK)` : w.nama);
    byRumah.set(w.rumahId, list);
  }

  const data = rows.map(({ rumah, jumlah }) => ({
    id: rumah.id,
    nomor: rumah.nomor,
    blok: rumah.blok,
    posX: Number(rumah.posX),
    posY: Number(rumah.posY),
    jumlahWarga: jumlah,
    penghuni: byRumah.get(rumah.id) ?? [],
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <MapPin className="size-5 text-emerald-600" /> Siteplan RT
        </h1>
        <p className="text-sm text-slate-500">
          Klik titik rumah untuk melihat detail penghuni.
        </p>
      </div>
      <SiteplanCanvas rumahs={data} isManager={isManager} />
      {!isManager && (
        <p className="text-xs text-slate-400">
          Posisi rumah diatur oleh pengurus.
        </p>
      )}
    </div>
  );
}
