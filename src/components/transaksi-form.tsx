"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { createTransaksiAction } from "@/lib/actions/iuran";
import type { Warga } from "@/db/schema";

export function TransaksiForm({ wargaList }: { wargaList: Warga[] }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [tipe, setTipe] = useState("masuk");

  return (
    <form
      action={(form) =>
        startTransition(async () => {
          const res = await createTransaksiAction({}, form);
          setMsg(res?.error ?? "Transaksi dicatat");
        })
      }
      className="grid gap-3 sm:grid-cols-2"
    >
      <div>
        <Label htmlFor="tipe">Tipe</Label>
        <Select id="tipe" name="tipe" value={tipe} onChange={(e) => setTipe(e.target.value)}>
          <option value="masuk">Pemasukan</option>
          <option value="keluar">Pengeluaran</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="kategori">Kategori</Label>
        <Select id="kategori" name="kategori">
          <option value="iuran">Iuran</option>
          <option value="donasi">Donasi</option>
          <option value="sumbangan">Sumbangan</option>
          <option value="kebersihan">Kebersihan</option>
          <option value="keamanan">Keamanan</option>
          <option value="kegiatan">Kegiatan</option>
          <option value="perawatan">Perawatan</option>
          <option value="lain">Lain-lain</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="jumlah">Jumlah (Rp)</Label>
        <Input id="jumlah" name="jumlah" type="number" required />
      </div>
      <div>
        <Label htmlFor="tanggal">Tanggal</Label>
        <Input id="tanggal" name="tanggal" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
      </div>
      <div>
        <Label htmlFor="keterangan">Keterangan</Label>
        <Input id="keterangan" name="keterangan" placeholder="cth: Iuran bulan Juli" />
      </div>
      {tipe === "masuk" && (
        <div>
          <Label htmlFor="wargaId">Dari Warga</Label>
          <Select id="wargaId" name="wargaId">
            <option value="">-</option>
            {wargaList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nama} (Rmh {w.noRumah ?? "-"})
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" /> {pending ? "Menyimpan..." : "Catat Transaksi"}
        </Button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </div>
    </form>
  );
}
