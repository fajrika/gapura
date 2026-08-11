import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";
import { WargaForm } from "@/components/warga-form";
import { updateWargaAction } from "@/lib/actions/warga";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function WargaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) redirect("/warga");

  const { id } = await params;
  const warga = await db.query.wargas.findFirst({
    where: eq(wargas.id, Number(id)),
  });
  if (!warga) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Edit Warga</h1>
      <Card>
        <CardHeader>
          <CardTitle>{warga.nama}</CardTitle>
        </CardHeader>
        <CardContent>
          <WargaForm
            warga={warga}
            action={(prev, form) => updateWargaAction(warga.id, prev, form)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
