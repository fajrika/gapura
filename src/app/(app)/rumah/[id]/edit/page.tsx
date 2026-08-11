import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rumahs } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { RumahForm } from "@/components/rumah-form";
import { updateRumahAction } from "@/lib/actions/rumah";

export const dynamic = "force-dynamic";

export default async function EditRumahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) throw new Error("Tidak punya akses");

  const { id } = await params;
  const rumah = await db.query.rumahs.findFirst({
    where: eq(rumahs.id, Number(id)),
  });
  if (!rumah) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Edit Rumah {rumah.nomor}
        </h1>
        <p className="text-sm text-slate-500">Perbarui informasi rumah</p>
      </div>
      <Card>
        <CardContent>
          <RumahForm
            action={updateRumahAction.bind(null, rumah.id)}
            rumah={rumah}
          />
        </CardContent>
      </Card>
    </div>
  );
}
