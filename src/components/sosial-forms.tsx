"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import type { SosialActionState } from "@/lib/actions/sosial";
import { Check, UserCheck } from "lucide-react";

function Submit({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : text}
    </Button>
  );
}

export function KegiatanForm({
  action,
}: {
  action: (prev: SosialActionState, form: FormData) => Promise<SosialActionState>;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="judul">Judul *</Label>
        <Input id="judul" name="judul" placeholder="cth: Kerja Bakti" required />
      </div>
      <div>
        <Label htmlFor="tanggal">Tanggal *</Label>
        <Input id="tanggal" name="tanggal" type="date" required />
      </div>
      <div>
        <Label htmlFor="tempat">Tempat</Label>
        <Input id="tempat" name="tempat" placeholder="cth: Lapangan RT" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="keterangan">Keterangan</Label>
        <Textarea id="keterangan" name="keterangan" rows={2} />
      </div>
      <FormErrors state={state} />
      <div className="sm:col-span-2">
        <Submit text="Simpan Kegiatan" />
      </div>
    </form>
  );
}

export function PresensiButton({
  kegiatanId,
  hadir,
  action,
}: {
  kegiatanId: number;
  hadir: boolean;
  action: (id: number) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant={hadir ? "secondary" : "primary"}
      disabled={pending}
      onClick={() => startTransition(() => action(kegiatanId))}
    >
      {hadir ? <Check className="size-3.5" /> : <UserCheck className="size-3.5" />}
      {pending ? "..." : hadir ? "Hadir (klik untuk batal)" : "Saya Hadir"}
    </Button>
  );
}
