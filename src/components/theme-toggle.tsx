"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean {
  return false;
}

function notify() {
  listeners.forEach((cb) => cb());
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    notify();
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">Mode Gelap</p>
        <p className="text-xs text-slate-400">
          Tampilan gelap lebih nyaman di malam hari.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
          dark ? "bg-emerald-600" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 flex size-6 items-center justify-center rounded-full bg-white text-slate-600 shadow transition-transform",
            dark && "translate-x-5 text-slate-800",
          )}
        >
          {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
        </span>
      </button>
    </div>
  );
}
