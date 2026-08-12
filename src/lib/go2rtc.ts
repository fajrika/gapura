import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cameras } from "@/db/schema";

const go2rtcServerUrl = process.env.GO2RTC_URL ?? "http://localhost:1984";
const go2rtcUser = process.env.GO2RTC_USER ?? "";
const go2rtcPass = process.env.GO2RTC_PASSWORD ?? "";

function authHeader(): Record<string, string> {
  if (!go2rtcUser) return {};
  return {
    Authorization: `Basic ${Buffer.from(`${go2rtcUser}:${go2rtcPass}`).toString("base64")}`,
  };
}

// URL go2rtc yang bisa dipakai browser (embed kredensial di dalam URL)
export function getGo2rtcClientUrl(host?: string): string {
  const base = process.env.GO2RTC_URL ?? `http://${host ?? "localhost"}:1984`;
  if (!go2rtcUser) return base;
  const url = new URL(base);
  url.username = go2rtcUser;
  url.password = go2rtcPass;
  return url.toString().replace(/\/$/, "");
}

// Sinkronkan stream go2rtc dengan daftar kamera aktif di DB.
// Hanya menulis config & restart bila ada perbedaan.
export async function syncGo2rtcStreams(): Promise<boolean> {
  const rows = await db.select().from(cameras).where(eq(cameras.enabled, true));

  // Setiap kamera punya 2 sumber: transcode ffmpeg ke H.264 (diutamakan
  // agar bisa diputar di semua browser) + RTSP asli (H.265). go2rtc
  // memakai sumber pertama yang cocok dengan kemampuan perangkat.
  const desired: Record<string, unknown> = {};
  for (const c of rows) {
    desired[`camera-${c.id}`] = [
      `ffmpeg:camera-${c.id}#video=h264#veryfast`,
      c.rtspUrl,
    ];
  }

  try {
    const res = await fetch(`${go2rtcServerUrl}/api/streams`, {
      headers: authHeader(),
    });
    if (!res.ok) return false;
    const current = (await res.json()) as Record<string, unknown>;
    const have = Object.keys(current);

    const need = Object.keys(desired);
    const unchanged =
      have.length === need.length && need.every((n) => have.includes(n));
    if (unchanged) return false;

    const configRes = await fetch(`${go2rtcServerUrl}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ streams: desired }),
    });
    if (!configRes.ok) return false;

    await fetch(`${go2rtcServerUrl}/api/restart`, {
      method: "POST",
      headers: authHeader(),
    });
    return true;
  } catch {
    return false;
  }
}
