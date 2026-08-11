import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaInstaller } from "@/components/pwa/pwa-installer";

export const metadata: Metadata = {
  title: {
    default: "Gapura — Aplikasi RT/RW",
    template: "%s | Gapura",
  },
  description:
    "Gapura — aplikasi manajemen RT/RW: data warga, iuran & kas, pengumuman, surat, ronda, kegiatan, dan arisan.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gapura",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <PwaInstaller />
      </body>
    </html>
  );
}
