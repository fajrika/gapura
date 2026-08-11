"use client";

import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Video } from "lucide-react";
import type { Camera } from "@/db/schema";

export function CameraPlayer({
  camera,
  go2rtcUrl,
}: {
  camera: Camera;
  go2rtcUrl: string;
}) {
  const [ptzError, setPtzError] = useState("");

  const streamUrl = `${go2rtcUrl}/stream.html?src=${encodeURIComponent(camera.rtspUrl)}&mode=webrtc`;

  const ptz = async (move: string) => {
    setPtzError("");
    try {
      const res = await fetch(
        `${go2rtcUrl}/api/ptz?src=${encodeURIComponent(camera.rtspUrl)}&move=${move}`,
      );
      if (!res.ok) throw new Error("gagal");
    } catch {
      setPtzError("Kontrol PTZ gagal. Pastikan go2rtc & kredensial ONVIF benar.");
    }
  };

  const canPtz = Boolean(camera.onvifHost && camera.onvifUsername);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
      <div className="flex items-center justify-between bg-slate-900 px-3 py-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-white">
          <Video className="size-3.5 text-emerald-400" /> {camera.nama}
          {camera.lokasi && (
            <span className="text-xs text-slate-400">· {camera.lokasi}</span>
          )}
        </p>
        {canPtz && (
          <div className="flex gap-1">
            <button
              onClick={() => ptz("up")}
              className="rounded bg-slate-700 p-1 text-white hover:bg-slate-600"
              title="Naik"
            >
              <ArrowUp className="size-3" />
            </button>
            <button
              onClick={() => ptz("left")}
              className="rounded bg-slate-700 p-1 text-white hover:bg-slate-600"
              title="Kiri"
            >
              <ArrowLeft className="size-3" />
            </button>
            <button
              onClick={() => ptz("right")}
              className="rounded bg-slate-700 p-1 text-white hover:bg-slate-600"
              title="Kanan"
            >
              <ArrowRight className="size-3" />
            </button>
            <button
              onClick={() => ptz("down")}
              className="rounded bg-slate-700 p-1 text-white hover:bg-slate-600"
              title="Turun"
            >
              <ArrowDown className="size-3" />
            </button>
          </div>
        )}
      </div>
      {ptzError && (
        <p className="bg-amber-50 px-3 py-1 text-xs text-amber-700">{ptzError}</p>
      )}
      <iframe
        src={streamUrl}
        title={camera.nama}
        className="aspect-video w-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    </div>
  );
}
