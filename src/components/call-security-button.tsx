"use client";

import { useState, useTransition } from "react";
import { callSecurityAction } from "@/lib/actions/security";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";

export function CallSecurityButton() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const doCall = () => {
    startTransition(async () => {
      try {
        await callSecurityAction();
        setDone(true);
        setTimeout(() => setDone(false), 4000);
      } catch {
        setDone(false);
      }
    });
    setConfirming(false);
  };

  if (done) {
    return (
      <Button className="bg-emerald-600 text-white">
        <Siren className="size-4" /> Panggilan terkirim
      </Button>
    );
  }

  return (
    <>
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-xl">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-red-100">
              <Siren className="size-7 text-red-600" />
            </div>
            <p className="font-semibold text-slate-900">Panggil Security?</p>
            <p className="mt-1 text-sm text-slate-500">
              Security akan menerima notifikasi suara keras.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirming(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={doCall}
                disabled={isPending}
              >
                {isPending ? "Mengirim..." : "Panggil"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Button
        className="bg-red-600 text-white hover:bg-red-700"
        onClick={() => setConfirming(true)}
      >
        <Siren className="size-4" /> Panggil Security
      </Button>
    </>
  );
}
