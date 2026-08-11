"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteWargaButton({
  id,
  nama,
  action,
}: {
  id: number;
  nama: string;
  action: (id: number) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus data warga "${nama}"?`)) {
          startTransition(() => action(id));
        }
      }}
    >
      <Trash2 className="size-4" /> {pending ? "Menghapus..." : "Hapus"}
    </Button>
  );
}
