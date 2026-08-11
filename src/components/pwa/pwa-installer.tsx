"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstaller() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !installEvent) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg md:bottom-4 md:left-72">
      <div className="flex items-center gap-2">
        <Bell className="size-5 text-emerald-600" />
        <p className="text-sm text-slate-700">
          Pasang aplikasi di layar utama untuk akses lebih cepat.
        </p>
      </div>
      <button
        onClick={() => installEvent.prompt()}
        className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Pasang
      </button>
    </div>
  );
}
