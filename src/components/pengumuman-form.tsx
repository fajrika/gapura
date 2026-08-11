"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import type { PengumumanActionState } from "@/lib/actions/pengumuman";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menerbitkan..." : "Terbitkan"}
    </Button>
  );
}

export function PengumumanForm({
  action,
}: {
  action: (prev: PengumumanActionState, form: FormData) => Promise<PengumumanActionState>;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="judul">Judul *</Label>
        <Input id="judul" name="judul" placeholder="Judul pengumuman" required />
      </div>
      <div>
        <Label htmlFor="isi">Isi *</Label>
        <Textarea id="isi" name="isi" rows={4} placeholder="Isi pengumuman..." required />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="pinned"
          className="size-4 rounded border-slate-300 text-emerald-600"
        />
        Sematkan di atas
      </label>
      <FormErrors state={state} />
      <Submit />
    </form>
  );
}
