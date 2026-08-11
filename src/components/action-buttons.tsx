"use client";

import { useTransition } from "react";
import { Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PinButton({
  id,
  pinned,
  action,
}: {
  id: number;
  pinned: boolean;
  action: (id: number, pinned: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant="ghost"
      title={pinned ? "Lepas sematan" : "Sematkan"}
      disabled={pending}
      onClick={() => startTransition(() => action(id, !pinned))}
    >
      <Pin className={`size-3.5 ${pinned ? "fill-emerald-600 text-emerald-600" : ""}`} />
    </Button>
  );
}

export function DeleteGenericButton({
  id,
  action,
  label,
}: {
  id: number;
  action: (id: number) => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant="ghost"
      title="Hapus"
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus ${label ?? "data"} ini?`)) {
          startTransition(() => action(id));
        }
      }}
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
