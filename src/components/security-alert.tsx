"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Siren, X } from "lucide-react";

// Overlay alarm layar penuh saat SW menerima panggilan security.
// Bunyi keras via WebAudio + vibrate, muncul di halaman mana pun yang terbuka.
export function SecurityAlert() {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSound = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  };

  const startSound = () => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const playLoop = (startAt: number) => {
        const dur = 1.2;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, startAt);
        osc.frequency.setValueAtTime(440, startAt + dur / 2);
        gain.gain.setValueAtTime(0.9, startAt);
        gain.gain.setValueAtTime(0.9, startAt + dur - 0.05);
        gain.gain.setValueAtTime(0, startAt + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + dur);
        if (startAt < ctx.currentTime + 8) {
          playLoop(startAt + dur + 0.2);
        }
      };
      playLoop(ctx.currentTime + 0.05);
    } catch {
      // audio tidak didukung — vibrate saja
    }
    if (navigator.vibrate) {
      navigator.vibrate([1200, 400, 1200, 400, 3000]);
    }
  };

  const stopAlert = () => {
    stopSound();
    setActive(false);
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; payload?: { body?: string } } | undefined;
      if (data?.type === "SECURITY_CALL") {
        setMessage(data.payload?.body ?? "Ada panggilan security");
        setActive(true);
        startSound();
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
      stopSound();
    };
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-red-700 px-6 text-center text-white">
      <Siren className="size-20 animate-pulse" />
      <h1 className="text-2xl font-bold uppercase tracking-wide">
        Panggilan Security
      </h1>
      <p className="max-w-md text-sm">{message}</p>
      <div className="flex gap-3">
        <Link
          href="/security"
          onClick={stopAlert}
          className="rounded-xl bg-white px-5 py-2.5 font-semibold text-red-700"
        >
          Lihat Detail
        </Link>
        <button
          onClick={stopAlert}
          className="flex items-center gap-1.5 rounded-xl border border-white/50 px-5 py-2.5 text-sm font-medium"
        >
          <X className="size-4" /> Tutup Alarm
        </button>
      </div>
    </div>
  );
}
