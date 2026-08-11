"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Wallet,
  Landmark,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/warga", label: "Warga", icon: Users },
  { href: "/iuran", label: "Iuran", icon: Wallet },
  { href: "/kas", label: "Kas", icon: Landmark },
  { href: "/menu", label: "Menu", icon: LayoutGrid },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-emerald-600" : "text-slate-400",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();

  const menu: { title: string; items: { href: string; label: string; icon: typeof Home }[] }[] = [
    {
      title: "Utama",
      items: [
        { href: "/dashboard", label: "Beranda", icon: Home },
        { href: "/warga", label: "Warga", icon: Users },
        { href: "/iuran", label: "Iuran & Tagihan", icon: Wallet },
        { href: "/kas", label: "Kas & Laporan", icon: Landmark },
      ],
    },
    {
      title: "Layanan",
      items: [
        { href: "/pengumuman", label: "Pengumuman", icon: LayoutGrid },
        { href: "/agenda", label: "Agenda", icon: LayoutGrid },
        { href: "/surat", label: "Surat", icon: LayoutGrid },
        { href: "/ronda", label: "Ronda", icon: LayoutGrid },
        { href: "/kejadian", label: "Laporan Kejadian", icon: LayoutGrid },
        { href: "/keluhan", label: "Keluhan", icon: LayoutGrid },
        { href: "/kegiatan", label: "Kegiatan", icon: LayoutGrid },
        { href: "/arisan", label: "Arisan", icon: LayoutGrid },
        { href: "/pengaturan", label: "Pengaturan", icon: LayoutGrid },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
          RT
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Aplikasi RT/RW</p>
          <p className="text-xs text-slate-400">{userName}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {menu.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group.title}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                    active
                      ? "bg-emerald-50 font-medium text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 px-3 py-3 text-xs text-slate-400">
        Role: {userRole}
      </div>
    </aside>
  );
}
