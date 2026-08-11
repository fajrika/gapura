import Link from "next/link";
import {
  Megaphone,
  CalendarDays,
  FileText,
  ShieldCheck,
  ClipboardList,
  MessageSquareWarning,
  PartyPopper,
  PiggyBank,
  Settings,
  User,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

const items = [
  { href: "/pengumuman", label: "Pengumuman", icon: Megaphone, desc: "Berita & info RT" },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, desc: "Jadwal kegiatan & rapat" },
  { href: "/surat", label: "Surat", icon: FileText, desc: "Ajukan & pantau surat" },
  { href: "/ronda", label: "Ronda", icon: ShieldCheck, desc: "Jadwal jaga malam" },
  { href: "/kejadian", label: "Kejadian", icon: ClipboardList, desc: "Buku siskamling" },
  { href: "/keluhan", label: "Keluhan", icon: MessageSquareWarning, desc: "Lapor masalah warga" },
  { href: "/kegiatan", label: "Kegiatan", icon: PartyPopper, desc: "Acara & daftar hadir" },
  { href: "/arisan", label: "Arisan", icon: PiggyBank, desc: "Arisan warga" },
];

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const session = await getSession();
  if (!session) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Menu Layanan</h1>
        <p className="text-sm text-slate-500">Semua fitur aplikasi RT/RW</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-emerald-300">
              <Icon className="size-6 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/profil">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <User className="size-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Profil Saya</p>
              <p className="text-xs text-slate-400">Data diri & akun</p>
            </div>
          </div>
        </Link>
        <Link href="/pengaturan">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Settings className="size-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Pengaturan</p>
              <p className="text-xs text-slate-400">Info & notifikasi</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
