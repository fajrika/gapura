import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { rumahs, tagihan, transaksis, wargas } from "@/db/schema";

export const dynamic = "force-dynamic";

// Webhook Xendit: konfirmasi pembayaran VA / QRIS
// VA: external_id = gapura-rumah-<rumahId>  → lunaskan tagihan kepala keluarga rumah itu
// QRIS: external_id = gapura-tagihan-<tagihanId> → lunaskan tagihan tsb
export async function POST(req: NextRequest) {
  const token = process.env.XENDIT_WEBHOOK_TOKEN;
  const callbackToken = req.headers.get("x-callback-token");
  if (token && callbackToken !== token) {
    return NextResponse.json({ ok: false, error: "invalid token" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const externalId = String(body.external_id ?? "");
  const amount = Number(body.amount ?? 0);
  const status = String(body.status ?? "").toUpperCase();

  if (amount <= 0 || (status !== "COMPLETED" && status !== "SUCCEEDED" && status !== "PAID")) {
    return NextResponse.json({ ok: true }); // abaikan yang belum lunas
  }

  let targetTagihan: { id: number; wargaId: number; jumlah: string } | null = null;

  if (externalId.startsWith("gapura-tagihan-")) {
    const tagihanId = Number(externalId.replace("gapura-tagihan-", ""));
    const t = await db.query.tagihan.findFirst({
      where: and(eq(tagihan.id, tagihanId), eq(tagihan.status, "belum")),
    });
    if (t && Math.abs(Number(t.jumlah) - amount) <= 500) {
      targetTagihan = t;
    }
  } else if (externalId.startsWith("gapura-rumah-")) {
    const rumahId = Number(externalId.replace("gapura-rumah-", ""));
    const rumah = await db.query.rumahs.findFirst({ where: eq(rumahs.id, rumahId) });
    if (rumah) {
      const kepala = await db.query.wargas.findFirst({
        where: and(eq(wargas.rumahId, rumahId), eq(wargas.isKepalaKeluarga, true)),
      });
      if (kepala) {
        const t = await db.query.tagihan.findFirst({
          where: and(eq(tagihan.wargaId, kepala.id), eq(tagihan.status, "belum")),
          orderBy: (tagihan, { asc }) => [asc(tagihan.periode)],
        });
        if (t && Math.abs(Number(t.jumlah) - amount) <= 500) {
          targetTagihan = t;
        }
      }
    }
  }

  if (!targetTagihan) {
    return NextResponse.json({ ok: false, error: "tagihan tidak ditemukan" }, { status: 404 });
  }

  await db
    .update(tagihan)
    .set({
      status: "lunas",
      tanggalBayar: new Date(),
      metode: externalId.startsWith("gapura-rumah-") ? "VA" : "QRIS",
    })
    .where(eq(tagihan.id, targetTagihan.id));

  await db.insert(transaksis).values({
    tipe: "masuk",
    kategori: "iuran",
    jumlah: String(amount),
    keterangan: `Pembayaran otomatis ${externalId.startsWith("gapura-rumah-") ? "VA" : "QRIS"} (tagihan #${targetTagihan.id})`,
    wargaId: targetTagihan.wargaId,
    tanggal: new Date().toISOString().slice(0, 10),
  });

  return NextResponse.json({ ok: true, tagihanId: targetTagihan.id });
}
