"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import type { SuratActionState } from "@/lib/actions/surat";

const jenisOptions = [
  "Surat Pengantar",
  "Surat Keterangan Domisili",
  "Surat Keterangan Tidak Mampu",
  "Surat Keterangan Usaha",
  "Surat Pengantar SKCK",
  "Surat Keterangan",
  "Surat Izin Keramaian",
  "Lainnya",
];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Mengirim..." : "Ajukan Surat"}
    </Button>
  );
}

export function AjukanSuratForm({
  action,
}: {
  action: (prev: SuratActionState, form: FormData) => Promise<SuratActionState>;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="jenis">Jenis Surat *</Label>
        <Select id="jenis" name="jenis">
          {jenisOptions.map((j) => (
            <option key={j}>{j}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="keperluan">Keperluan *</Label>
        <Textarea
          id="keperluan"
          name="keperluan"
          rows={3}
          placeholder="cth: Pengajuan pembuatan KTP baru"
          required
        />
      </div>
      <FormErrors state={state} />
      <Submit />
    </form>
  );
}

export { Input };
