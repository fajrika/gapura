"use client";

import { useState, useTransition } from "react";
import { Check, X, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setStatusSuratAction } from "@/lib/actions/surat";

export function SetStatusSurat({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  if (status === "disetujui") {
    return (
      <Button
        size="small"
        variant="secondary"
        disabled={pending}
        onClick={() => startTransition(() => setStatusSuratAction(id, "selesai"))}
      >
        <BadgeCheck className="size-3.5" /> Selesai
      </Button>
    );
  }

  if (status === "selesai") return null;

  return (
    <div className="flex gap-1">
      <Button
        size="small"
        disabled={pending}
        onClick={() => startTransition(() => setStatusSuratAction(id, "disetujui"))}
      >
        <Check className="size-3.5" /> Setujui
      </Button>
      <Button
        size="small"
        variant="danger"
        disabled={pending}
        onClick={() => {
          const catatan = prompt("Alasan penolakan (opsional):");
          startTransition(() => setStatusSuratAction(id, "ditolak", catatan ?? undefined));
        }}
      >
        <X className="size-3.5" /> Tolak
      </Button>
    </div>
  );
}
