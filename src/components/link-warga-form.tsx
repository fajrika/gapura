"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { linkWargaToRumahAction } from "@/lib/actions/rumah";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

export function LinkWargaForm({
  rumahId,
  wargaList,
}: {
  rumahId: number;
  wargaList: { id: number; nama: string; noRumah: string | null }[];
}) {
  const router = useRouter();
  const [wargaId, setWargaId] = useState("");
  const [isPending, startTransition] = useTransition();

  const link = () => {
    if (!wargaId) return;
    startTransition(async () => {
      await linkWargaToRumahAction(Number(wargaId), rumahId);
      router.refresh();
      setWargaId("");
    });
  };

  if (wargaList.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Semua warga sudah terhubung ke rumah.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select value={wargaId} onChange={(e) => setWargaId(e.target.value)}>
        <option value="">Pilih warga...</option>
        {wargaList.map((w) => (
          <option key={w.id} value={w.id}>
            {w.nama}
            {w.noRumah ? ` (Rumah ${w.noRumah})` : ""}
          </option>
        ))}
      </Select>
      <Button
        type="button"
        onClick={link}
        disabled={!wargaId || isPending}
        variant="secondary"
      >
        {isPending ? "Menghubungkan..." : "Hubungkan"}
      </Button>
    </div>
  );
}
