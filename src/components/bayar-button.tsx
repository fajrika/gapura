"use client";

import { useState, useTransition } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { bayarTagihanAction, batalBayarTagihanAction } from "@/lib/actions/iuran";

export function BayarButton({
  id,
  jumlah,
  wargaId,
}: {
  id: number;
  jumlah: string;
  wargaId: number;
}) {
  const [metode, setMetode] = useState("Tunai");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={metode}
        onChange={(e) => setMetode(e.target.value)}
        className="w-28 px-2 py-1.5 text-xs"
      >
        <option value="Tunai">Tunai</option>
        <option value="Transfer">Transfer</option>
        <option value="QRIS">QRIS</option>
      </Select>
      <Button
        size="small"
        disabled={pending}
        onClick={() =>
          startTransition(() =>
            bayarTagihanAction(id, metode, jumlah, wargaId),
          )
        }
      >
        <Check className="size-4" /> {pending ? "..." : "Bayar"}
      </Button>
    </div>
  );
}

export function BatalBayarButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant="ghost"
      disabled={pending}
      onClick={() => startTransition(() => batalBayarTagihanAction(id))}
    >
      <RotateCcw className="size-3.5" />
    </Button>
  );
}
