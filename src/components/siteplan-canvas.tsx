"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { setRumahPositionAction } from "@/lib/actions/rumah";
import { Home, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SiteplanRumah {
  id: number;
  nomor: string;
  blok: string | null;
  posX: number;
  posY: number;
  penghuni: string[];
  jumlahWarga: number;
}

export function SiteplanCanvas({
  rumahs,
  isManager,
}: {
  rumahs: SiteplanRumah[];
  isManager: boolean;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const selected = rumahs.find((r) => r.id === selectedId) ?? null;

  const placeSelected = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg || !selected) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setRumahPositionAction(selected.id, x, y).then(() => setSelectedId(null));
  };

  return (
    <div className="space-y-3">
      {isManager && (
        <div className="flex flex-wrap items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <MapPin className="mr-1 inline size-3.5" /> Atur Posisi Rumah
            </button>
          ) : (
            <p className="text-sm text-slate-600">
              Pilih rumah di peta, lalu klik lokasi barunya.{" "}
              <button
                onClick={() => {
                  setEditing(false);
                  setSelectedId(null);
                }}
                className="text-emerald-600 underline"
              >
                Selesai
              </button>
            </p>
          )}
          {editing && selected && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Menempatkan Rumah {selected.nomor}
            </span>
          )}
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 100 62"
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white",
          editing && "cursor-crosshair",
        )}
        onClick={(e) => {
          if (editing && selected) placeSelected(e.clientX, e.clientY);
        }}
      >
        {/* latar peta: jalan */}
        <rect x="0" y="0" width="100" height="62" fill="#f8fafc" />
        <rect x="30" y="0" width="4" height="62" fill="#e2e8f0" />
        <rect x="0" y="30" width="100" height="4" fill="#e2e8f0" />
        <text x="4" y="57" fontSize="2.2" fill="#94a3b8">
          Jl. Melati
        </text>

        {rumahs.map((r) => {
          const isSel = r.id === selectedId;
          return (
            <g
              key={r.id}
              transform={`translate(${r.posX}, ${r.posY})`}
              className={cn(
                editing && "cursor-pointer",
                !editing && "cursor-pointer",
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (editing) {
                  setSelectedId(editing ? r.id : r.id);
                } else {
                  setSelectedId(selectedId === r.id ? null : r.id);
                }
              }}
            >
              <circle
                r={editing ? 3.2 : 2.8}
                fill={isSel ? "#f59e0b" : "#059669"}
                stroke="#fff"
                strokeWidth="0.8"
              />
              <text
                y="4.6"
                textAnchor="middle"
                fontSize="2.6"
                fontWeight="bold"
                fill="#0f172a"
              >
                {r.nomor}
              </text>
            </g>
          );
        })}
      </svg>

      {selected && !editing && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-base font-bold text-slate-900">
                Rumah {selected.nomor}
                {selected.blok ? ` · Blok ${selected.blok}` : ""}
              </p>
              <p className="text-xs text-slate-400">
                {selected.jumlahWarga} penghuni ·{" "}
                {selected.penghuni.length > 0
                  ? selected.penghuni.join(", ")
                  : "belum ada penghuni terhubung"}
              </p>
            </div>
            <Link
              href={`/rumah/${selected.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Home className="size-3.5" /> Detail
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
