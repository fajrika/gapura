"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { FormErrors } from "@/components/form";
import {
  laporKejadianAction,
  laporKeluhanAction,
  updateKejadianAction,
  updateKeluhanAction,
  type LaporanActionState,
} from "@/lib/actions/laporan";

function Submit({ text, pendingText }: { text: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : text}
    </Button>
  );
}

export function KejadianForm() {
  const [state, action] = useActionState<LaporanActionState, FormData>(
    laporKejadianAction,
    {},
  );
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="tanggal">Tanggal *</Label>
          <Input id="tanggal" name="tanggal" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </div>
        <div>
          <Label htmlFor="jam">Jam</Label>
          <Input id="jam" name="jam" type="time" />
        </div>
      </div>
      <div>
        <Label htmlFor="jenis">Jenis Kejadian</Label>
        <Select id="jenis" name="jenis">
          <option>Keamanan</option>
          <option>Kebakaran</option>
          <option>Bencana</option>
          <option>Kecelakaan</option>
          <option>Kerusuhan</option>
          <option>Lainnya</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="isi">Kronologi *</Label>
        <Textarea id="isi" name="isi" rows={3} required />
      </div>
      <FormErrors state={state} />
      <Submit text="Laporkan" pendingText="Mengirim..." />
    </form>
  );
}

export function KeluhanForm() {
  const [state, action] = useActionState<LaporanActionState, FormData>(
    laporKeluhanAction,
    {},
  );
  return (
    <form action={action} className="space-y-3">
      <div>
        <Label htmlFor="kategori">Kategori</Label>
        <Select id="kategori" name="kategori">
          <option value="kebersihan">Kebersihan</option>
          <option value="penerangan">Penerangan/Lampu</option>
          <option value="keamanan">Keamanan</option>
          <option value="jalan">Jalan & Drainase</option>
          <option value="lain">Lainnya</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="isi">Keluhan *</Label>
        <Textarea id="isi" name="isi" rows={3} placeholder="Tulis keluhan kamu..." required />
      </div>
      <FormErrors state={state} />
      <Submit text="Kirim Keluhan" pendingText="Mengirim..." />
    </form>
  );
}

export function UpdateKejadian({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition();
  if (status === "selesai") return null;
  return (
    <Button
      size="small"
      variant={status === "baru" ? "primary" : "secondary"}
      disabled={pending}
      onClick={() => {
        const tindakLanjut = prompt("Tindak lanjut / catatan:");
        startTransition(() => updateKejadianAction(id, "selesai", tindakLanjut ?? ""));
      }}
    >
      {pending ? "..." : status === "baru" ? "Tandai Ditangani" : "Selesaikan"}
    </Button>
  );
}

export function UpdateKeluhan({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition();
  if (status === "selesai") return null;
  return (
    <Button
      size="small"
      variant={status === "baru" ? "primary" : "secondary"}
      disabled={pending}
      onClick={() => {
        const catatan = prompt("Catatan penanganan:");
        startTransition(() => updateKeluhanAction(id, "selesai", catatan ?? ""));
      }}
    >
      {pending ? "..." : status === "baru" ? "Proses" : "Selesaikan"}
    </Button>
  );
}
