"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  createIuranAction,
  generateTagihanAction,
  toggleIuranAction,
} from "@/lib/actions/iuran";
import { currentPeriode } from "@/lib/utils";

export function GenerateTagihan() {
  const router = useRouter();
  const [periode, setPeriode] = useState(currentPeriode());
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  return (
    <div className="flex items-center gap-2">
      <Input
        type="month"
        value={periode}
        onChange={(e) => setPeriode(e.target.value)}
        className="w-40"
      />
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await generateTagihanAction(periode);
              router.refresh();
              setMsg("Tagihan dibuat");
              setTimeout(() => setMsg(""), 3000);
            } catch {
              setMsg("Gagal membuat tagihan");
            }
          })
        }
      >
        <FilePlus2 className="size-4" />
        {pending ? "Membuat..." : "Generate"}
      </Button>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
    </div>
  );
}

export function ToggleIuran({ id, aktif }: { id: number; aktif: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant={aktif ? "secondary" : "primary"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await toggleIuranAction(id, !aktif);
            router.refresh();
          } catch {
            // abaikan
          }
        })
      }
    >
      {aktif ? "Aktif" : "Nonaktif"}
    </Button>
  );
}

export function IuranForm() {
  const [state, formAction] = useActionState(createIuranAction, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div>
        <Label htmlFor="namaIuran">Nama</Label>
        <Input id="namaIuran" name="nama" placeholder="cth: Iuran Keamanan" className="w-48" required />
      </div>
      <div>
        <Label htmlFor="jumlahIuran">Jumlah (Rp)</Label>
        <Input id="jumlahIuran" name="jumlah" type="number" placeholder="50000" className="w-32" required />
      </div>
      <div>
        <Label htmlFor="hitungPer">Hitung per</Label>
        <select id="hitungPer" name="hitungPer" className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-sm">
          <option value="kk">KK</option>
          <option value="jiwa">Jiwa</option>
        </select>
      </div>
      <Button type="submit" size="small">
        <Plus className="size-4" /> Tambah
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">{state.success}</p>}
    </form>
  );
}
