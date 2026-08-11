import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { securityCalls, users, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { resolveSecurityCallAction } from "@/lib/actions/security";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui/card";
import { Siren } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { dbUser } = await requireAuth();
  const isManager = isPengurusRole(dbUser.role);
  const isSec = dbUser.role === "security" || isManager;

  const calls = isManager
    ? await db
        .select()
        .from(securityCalls)
        .orderBy(desc(securityCalls.createdAt))
        .limit(50)
    : isSec
      ? await db
          .select()
          .from(securityCalls)
          .where(eq(securityCalls.status, "dipanggil"))
          .orderBy(desc(securityCalls.createdAt))
          .limit(20)
      : await db
          .select()
          .from(securityCalls)
          .where(eq(securityCalls.callerUserId, dbUser.id))
          .orderBy(desc(securityCalls.createdAt))
          .limit(20);

  const [wargaList, userList] = await Promise.all([
    db.select().from(wargas),
    db.select().from(users),
  ]);
  const wargaById = new Map(wargaList.map((w) => [w.id, w]));
  const userById = new Map(userList.map((u) => [u.id, u]));

  const aktif = calls.filter((c) => c.status === "dipanggil").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Siren className="size-5 text-red-600" /> Security
        </h1>
        <p className="text-sm text-slate-500">
          {aktif > 0
            ? `${aktif} panggilan aktif`
            : "Tidak ada panggilan aktif"}
        </p>
      </div>

      <Card>
        <CardContent className="divide-y divide-slate-100 p-0">
          {calls.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500">
              Belum ada riwayat panggilan.
            </p>
          )}
          {calls.map((c) => {
            const warga = c.callerWargaId ? wargaById.get(c.callerWargaId) : null;
            const caller = c.callerUserId ? userById.get(c.callerUserId) : null;
            const responder = c.respondedByUserId
              ? userById.get(c.respondedByUserId)
              : null;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {warga?.nama ?? caller?.name ?? "Warga"}
                    {c.status === "dipanggil" && (
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    Rumah {warga?.noRumah ?? "-"} · {formatDateTime(c.createdAt)}
                    {c.status === "selesai" && responder
                      ? ` · Ditangani ${responder.name}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {c.status === "dipanggil" ? (
                    isSec ? (
                      <ResolveButton id={c.id} />
                    ) : (
                      <Badge variant="danger">Menunggu</Badge>
                    )
                  ) : (
                    <Badge variant="success">Selesai</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {!isSec && (
        <p className="text-xs text-slate-400">
          Ingin memanggil security? Gunakan tombol{" "}
          <Link href="/dashboard" className="text-emerald-600 underline">
            Panggil Security
          </Link>{" "}
          di Beranda.
        </p>
      )}
    </div>
  );
}

function ResolveButton({ id }: { id: number }) {
  return (
    <form action={resolveSecurityCallAction.bind(null, id)}>
      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Selesai
      </button>
    </form>
  );
}
