"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import type { AgendaActionState } from "@/lib/actions/agenda";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan Agenda"}
    </Button>
  );
}

export function AgendaForm({
  action,
}: {
  action: (prev: AgendaActionState, form: FormData) => Promise<AgendaActionState>;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="judul">Judul *</Label>
        <Input id="judul" name="judul" placeholder="cth: Rapat Warga" required />
      </div>
      <div>
        <Label htmlFor="tanggal">Tanggal *</Label>
        <Input id="tanggal" name="tanggal" type="date" required />
      </div>
      <div>
        <Label htmlFor="jam">Jam</Label>
        <Input id="jam" name="jam" type="time" />
      </div>
      <div>
        <Label htmlFor="tempat">Tempat</Label>
        <Input id="tempat" name="tempat" placeholder="cth: Balai RT" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="keterangan">Keterangan</Label>
        <Textarea id="keterangan" name="keterangan" rows={2} />
      </div>
      <FormErrors state={state} />
      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}
