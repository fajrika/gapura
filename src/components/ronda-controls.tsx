"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRondaAction, setStatusRondaAction } from "@/lib/actions/laporan";

export function GenerateRonda() {
  const [days, setDays] = useState("30");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="w-20"
        min={1}
        max={60}
      />
      <Button disabled={pending} onClick={() => startTransition(() => generateRondaAction(Number(days)))}>
        <CalendarClock className="size-4" />
        {pending ? "Membuat..." : "Generate"}
      </Button>
    </div>
  );
}

export function RondaStatus({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-1">
      <Button
        size="small"
        disabled={pending}
        onClick={() => startTransition(() => setStatusRondaAction(id, "hadir"))}
      >
        <Check className="size-3.5" /> Hadir
      </Button>
      <Button
        size="small"
        variant="danger"
        disabled={pending}
        onClick={() => startTransition(() => setStatusRondaAction(id, "tidak"))}
      >
        <X className="size-3.5" /> Tidak
      </Button>
    </div>
  );
}
