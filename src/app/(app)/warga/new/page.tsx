import { requireAuth, isPengurusRole } from "@/lib/auth";
import { WargaForm } from "@/components/warga-form";
import { createWargaAction } from "@/lib/actions/warga";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function WargaNewPage() {
  await requireAuth();
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) {
    return (
      <p className="text-sm text-red-600">Tidak punya akses untuk halaman ini.</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Tambah Warga</h1>
      <Card>
        <CardHeader>
          <CardTitle>Data Warga Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <WargaForm action={createWargaAction} />
        </CardContent>
      </Card>
    </div>
  );
}
