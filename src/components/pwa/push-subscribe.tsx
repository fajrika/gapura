"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY ?? "";

export function PushSubscribe() {
  const [supported] = useState(
    () =>
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      !!PUBLIC_KEY,
  );
  const [enabled, setEnabled] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!supported) return;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        const sub = await reg.pushManager.getSubscription();
        setEnabled(!!sub);
      } catch {
        /* ignore */
      }
    })();
  }, [supported]);

  const toggle = () =>
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: existing.endpoint }),
          });
          await existing.unsubscribe();
          setEnabled(false);
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
        setEnabled(true);
      } catch (e) {
        console.error(e);
        alert("Gagal mengaktifkan notifikasi. Pastikan izin diizinkan di browser.");
      }
    });

  if (!supported) {
    return (
      <p className="text-xs text-slate-400">
        Notifikasi tidak didukung di browser/device ini.
      </p>
    );
  }

  return (
    <Button variant={enabled ? "secondary" : "primary"} disabled={pending} onClick={toggle}>
      {enabled ? <BellRing className="size-4" /> : <Bell className="size-4" />}
      {pending ? "Memproses..." : enabled ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
