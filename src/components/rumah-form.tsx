"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import type { RumahActionState } from "@/lib/actions/rumah";
import type { Rumah } from "@/db/schema";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

export function RumahForm({
  action,
  rumah,
}: {
  action: (prev: RumahActionState, form: FormData) => Promise<RumahActionState>;
  rumah?: Rumah;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nomor">Nomor Rumah *</Label>
          <Input id="nomor" name="nomor" defaultValue={rumah?.nomor} required />
        </div>
        <div>
          <Label htmlFor="blok">Blok</Label>
          <Input id="blok" name="blok" defaultValue={rumah?.blok ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="alamat">Alamat Lengkap</Label>
        <Textarea id="alamat" name="alamat" defaultValue={rumah?.alamat ?? ""} rows={2} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <FormErrors state={state} />
      <Submit />
    </form>
  );
}
