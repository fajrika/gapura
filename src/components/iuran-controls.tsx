"use client";

import { useState, useTransition } from "react";
import { FilePlus2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  createIuranAction,
  generateTagihanAction,
  toggleIuranAction,
  type IuranActionState,
} from "@/lib/actions/iuran";
import { currentPeriode } from "@/lib/utils";

export function GenerateTagihan() {
  const [periode, setPeriode] = useState(currentPeriode());
  const [pending, startTransition] = useTransition();

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
        onClick={() => startTransition(() => generateTagihanAction(periode))}
      >
        <FilePlus2 className="size-4" />
        {pending ? "Membuat..." : "Generate"}
      </Button>
    </div>
  );
}

export function ToggleIuran({ id, aktif }: { id: number; aktif: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant={aktif ? "secondary" : "primary"}
      disabled={pending}
      onClick={() => startTransition(() => toggleIuranAction(id, !aktif))}
    >
      {aktif ? "Aktif" : "Nonaktif"}
    </Button>
  );
}

export function IuranForm() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<IuranActionState>({});

  return (
    <form
      action={(form) =>
        startTransition(async () => {
          const res = await createIuranAction({}, form);
          if (res?.error) setMsg(res);
        })
      }
      className="flex flex-wrap items-end gap-2"
    >
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
      <Button size="small" disabled={pending}>
        <Plus className="size-4" /> Tambah
      </Button>
      {msg.error && <p className="text-sm text-red-600">{msg.error}</p>}
    </form>
  );
}
