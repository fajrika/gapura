import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Build ID unik per build Next.js — dipakai PWA untuk deteksi versi baru
export async function GET() {
  let buildId = "dev";
  try {
    buildId = (await readFile(`${process.cwd()}/.next/BUILD_ID`, "utf8")).trim();
  } catch {
    // development / build tanpa BUILD_ID
  }
  return NextResponse.json({ buildId }, { headers: { "Cache-Control": "no-store" } });
}
