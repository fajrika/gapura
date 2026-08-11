"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import type { WargaActionState } from "@/lib/actions/warga";
import type { Warga } from "@/db/schema";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

export function WargaForm({
  action,
  warga,
}: {
  action: (prev: WargaActionState, form: FormData) => Promise<WargaActionState>;
  warga?: Warga;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nama">Nama Lengkap *</Label>
          <Input id="nama" name="nama" defaultValue={warga?.nama} required />
        </div>
        <div>
          <Label htmlFor="nik">NIK (16 digit) *</Label>
          <Input
            id="nik"
            name="nik"
            inputMode="numeric"
            maxLength={20}
            defaultValue={warga?.nik}
            required
          />
        </div>
        <div>
          <Label htmlFor="nkk">No. KK</Label>
          <Input
            id="nkk"
            name="nkk"
            inputMode="numeric"
            maxLength={20}
            defaultValue={warga?.nkk ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="jk">Jenis Kelamin</Label>
          <Select id="jk" name="jk" defaultValue={warga?.jk ?? "L"}>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="tglLahir">Tanggal Lahir</Label>
          <Input
            id="tglLahir"
            name="tglLahir"
            type="date"
            defaultValue={warga?.tglLahir ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="agama">Agama</Label>
          <Select id="agama" name="agama" defaultValue={warga?.agama ?? ""}>
            <option value="">Pilih...</option>
            <option>Islam</option>
            <option>Kristen</option>
            <option>Katolik</option>
            <option>Hindu</option>
            <option>Buddha</option>
            <option>Konghucu</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="statusTinggal">Status Tinggal</Label>
          <Select
            id="statusTinggal"
            name="statusTinggal"
            defaultValue={warga?.statusTinggal ?? "tetap"}
          >
            <option value="tetap">Tetap</option>
            <option value="kontrak">Kontrak</option>
            <option value="sewa">Sewa</option>
            <option value="kos">Kos</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="pekerjaan">Pekerjaan</Label>
          <Input
            id="pekerjaan"
            name="pekerjaan"
            defaultValue={warga?.pekerjaan ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="noRumah">No. Rumah / Alamat</Label>
          <Input
            id="noRumah"
            name="noRumah"
            placeholder="cth: 12A"
            defaultValue={warga?.noRumah ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="telepon">No. HP</Label>
          <Input
            id="telepon"
            name="telepon"
            type="tel"
            defaultValue={warga?.telepon ?? ""}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isKepalaKeluarga"
          className="size-4 rounded border-slate-300 text-emerald-600"
          defaultChecked={warga?.isKepalaKeluarga ?? false}
        />
        Kepala Keluarga (KK)
      </label>
      <FormErrors state={state} />
      <div className="flex gap-2">
        <Submit />
        <Button type="button" variant="ghost" onClick={() => history.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}

export { Textarea };
