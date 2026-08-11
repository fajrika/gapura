import { NextRequest, NextResponse } from "next/server";
import { and, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { transaksis, wargas } from "@/db/schema";
import { requireAuth, isPengurusRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { dbUser } = await requireAuth();
  if (!isPengurusRole(dbUser.role)) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const month = request.nextUrl.searchParams.get("month") || "";
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Bulan tidak valid" }, { status: 400 });
  }

  const [y, m] = month.split("-").map(Number);
  const end = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;

  const [rows, wargaList] = await Promise.all([
    db
      .select({
        tipe: transaksis.tipe,
        kategori: transaksis.kategori,
        jumlah: transaksis.jumlah,
        keterangan: transaksis.keterangan,
        wargaId: transaksis.wargaId,
        tanggal: transaksis.tanggal,
      })
      .from(transaksis)
      .where(
        and(
          gte(transaksis.tanggal, `${month}-01`),
          lt(transaksis.tanggal, `${end}-01`),
        ),
      )
      .orderBy(transaksis.tanggal),
    db.select().from(wargas),
  ]);

  const wargaById = new Map(wargaList.map((w) => [w.id, w.nama]));

  const header = ["Tanggal", "Tipe", "Kategori", "Jumlah", "Warga", "Keterangan"];
  const lines = rows.map((r) =>
    [
      r.tanggal,
      r.tipe,
      r.kategori,
      r.jumlah,
      r.wargaId ? wargaById.get(r.wargaId) ?? "" : "",
      (r.keterangan ?? "").replace(/,/g, ";"),
    ].join(","),
  );

  const csv = [header.join(","), ...lines].join("\n");
  const filename = `laporan-kas-${month}.csv`;

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
