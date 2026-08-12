"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import type { SosialActionState } from "@/lib/actions/sosial";
import {
  tambahAnggotaArisanAction,
  setArisanStatusAction,
} from "@/lib/actions/sosial";
import type { Warga } from "@/db/schema";
import { Check, X, Plus } from "lucide-react";

function Submit({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="small" disabled={pending}>
      {pending ? "..." : text}
    </Button>
  );
}

export function ArisanForm({
  action,
}: {
  action: (prev: SosialActionState, form: FormData) => Promise<SosialActionState>;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div>
        <Label htmlFor="nama">Nama</Label>
        <Input id="nama" name="nama" placeholder="cth: Arisan Ibu-Ibu" className="w-48" required />
      </div>
      <div>
        <Label htmlFor="iuran">Iuran (Rp)</Label>
        <Input id="iuran" name="iuran" type="number" placeholder="50000" className="w-32" required />
      </div>
      <FormErrors state={state} />
      <Submit text="Buat" />
    </form>
  );
}

export function TambahAnggota({
  arisanId,
  wargaList,
}: {
  arisanId: number;
  wargaList: Warga[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(form) => {
        const wargaId = Number(form.get("wargaId"));
        const urutan = Number(form.get("urutan") || 0);
        if (wargaId)
          startTransition(async () => {
            try {
              await tambahAnggotaArisanAction(arisanId, wargaId, urutan);
              router.refresh();
            } catch {
              // abaikan
            }
          });
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <div>
        <Label htmlFor={`w-${arisanId}`}>Tambah Anggota</Label>
        <Select id={`w-${arisanId}`} name="wargaId" className="w-56">
          <option value="">Pilih warga...</option>
          {wargaList.map((w) => (
            <option key={w.id} value={w.id}>
              {w.nama} (Rmh {w.noRumah ?? "-"})
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={`u-${arisanId}`}>Urutan</Label>
        <Input
          id={`u-${arisanId}`}
          name="urutan"
          type="number"
          defaultValue={0}
          className="w-20"
        />
      </div>
      <Button type="submit" size="small" disabled={pending}>
        <Plus className="size-3.5" /> Tambah
      </Button>
    </form>
  );
}

export function ArisanStatus({
  id,
  dibayar,
  dicairkan,
}: {
  id: number;
  dibayar: boolean;
  dicairkan: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const toggle = (field: "dibayar" | "dicairkan", value: boolean) =>
    startTransition(async () => {
      try {
        await setArisanStatusAction(id, field, value);
        router.refresh();
      } catch {
        // abaikan
      }
    });
  return (
    <div className="flex items-center gap-1">
      <Button
        size="small"
        variant={dibayar ? "secondary" : "primary"}
        disabled={pending}
        title={dibayar ? "Tandai belum bayar" : "Tandai sudah bayar"}
        onClick={() => toggle("dibayar", !dibayar)}
      >
        {dibayar ? <X className="size-3.5" /> : <Check className="size-3.5" />}
        {dibayar ? "Bayar" : "Bayar"}
      </Button>
      <Button
        size="small"
        variant={dicairkan ? "secondary" : "primary"}
        disabled={pending}
        title={dicairkan ? "Batalkan pencairan" : "Tandai sudah cair"}
        onClick={() => toggle("dicairkan", !dicairkan)}
      >
        {dicairkan ? "Cair" : "Cair"}
      </Button>
    </div>
  );
}
