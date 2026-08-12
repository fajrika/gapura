"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const FORCE_UPDATE_SECONDS = 30;
const VERSION_KEY = "gapura-version";

export function PwaInstaller() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [countdown, setCountdown] = useState(FORCE_UPDATE_SECONDS);
  const reloadingRef = useRef(false);

  const applyUpdate = useCallback(() => {
    // simpan versi build baru dulu agar banner tidak muncul lagi setelah reload
    fetch("/api/version", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.buildId) localStorage.setItem(VERSION_KEY, d.buildId);
      })
      .catch(() => {})
      .finally(() => {
        reloadingRef.current = true;
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg?.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          } else {
            window.location.reload();
          }
        });
      });
  }, []);

  useEffect(() => {
    let registration: ServiceWorkerRegistration | undefined;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        registration?.update().catch(() => {});
      }
    };
    const onControllerChange = () => {
      if (reloadingRef.current) window.location.reload();
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    document.addEventListener("visibilitychange", onVisibility);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          registration = reg;
          reg.update().catch(() => {});

          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            if (!sw) return;
            sw.addEventListener("statechange", () => {
              if (sw.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setCountdown(FORCE_UPDATE_SECONDS);
              }
            });
          });
        })
        .catch(() => {});
    }

    // Deteksi versi build: notif update walau service worker tidak berubah
    fetch("/api/version", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const stored = localStorage.getItem(VERSION_KEY);
        if (!d.buildId || !stored) {
          if (d.buildId) localStorage.setItem(VERSION_KEY, d.buildId);
          return;
        }
        if (stored !== d.buildId) {
          setUpdateAvailable(true);
          setCountdown(FORCE_UPDATE_SECONDS);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisibility);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  // Countdown tampilan + paksa update setelah 30 detik tanpa diklik
  useEffect(() => {
    if (!updateAvailable) return;
    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    const timeout = setTimeout(applyUpdate, FORCE_UPDATE_SECONDS * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [updateAvailable, applyUpdate]);

  return (
    <>
      {updateAvailable && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 bg-emerald-600 px-4 py-2.5 text-white">
          <p className="text-sm font-medium">
            Versi baru tersedia{countdown > 0 && countdown < FORCE_UPDATE_SECONDS
              ? ` — update otomatis dalam ${countdown} dtk`
              : ""}
          </p>
          <button
            onClick={applyUpdate}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700"
          >
            <RefreshCw className="size-3.5" /> Muat Ulang
          </button>
        </div>
      )}

      {!installed && installEvent && (
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
      )}
    </>
  );
}
