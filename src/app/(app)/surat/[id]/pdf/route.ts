import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import PDFDocument from "pdfkit";
import { db } from "@/db";
import { suratPengajuans, wargas, settings } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { dbUser } = await requireAuth();

  const { id } = await params;
  const surat = await db.query.suratPengajuans.findFirst({
    where: eq(suratPengajuans.id, Number(id)),
  });
  if (!surat) {
    return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
  }

  if (dbUser.wargaId && surat.wargaId !== dbUser.wargaId) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const [warga, settingRows] = await Promise.all([
    db.query.wargas.findFirst({ where: eq(wargas.id, surat.wargaId) }),
    db.select().from(settings),
  ]);
  if (!warga) {
    return NextResponse.json({ error: "Data warga tidak ditemukan" }, { status: 404 });
  }

  const get = (key: string) => settingRows.find((s) => s.key === key)?.value ?? "";

  const doc = new PDFDocument({ size: "A4", margins: { top: 60, bottom: 60, left: 60, right: 60 } });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const today = new Date();
    const tanggal =
      today.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

    doc.font(FONT_BOLD, 11).fillColor("#000000");
    doc.text("PEMERINTAH KOTA " + get("kota").toUpperCase(), { align: "center" });
    doc.text("KECAMATAN " + get("kecamatan").toUpperCase(), { align: "center" });
    doc.text("KELURAHAN " + get("kelurahan").toUpperCase(), { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(12);
    doc.text(`RUKUN TETANGGA ${get("nama_rt")} / RUKUN WARGA ${get("nama_rw")}`, { align: "center" });
    doc.text("SEKERTARIAT: " + get("alamat_kantor").toUpperCase(), { align: "center" });
    doc.moveDown(0.2);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).lineWidth(1.5).stroke();
    doc.moveDown(0.4);

    doc.font(FONT_BOLD, 14).text("SURAT KETERANGAN", { align: "center" });
    doc.moveDown(0.3);
    doc.font(FONT, 10).text(`Nomor: ${surat.noSurat ?? "-"}`, { align: "center" });
    doc.moveDown(0.6);

    doc.font(FONT, 11);
    doc.text("Yang bertanda tangan di bawah ini, Ketua RT " + get("nama_rt") + " Kelurahan " + get("kelurahan") + " Kecamatan " + get("kecamatan") + " Kota " + get("kota") + ", menerangkan bahwa:");
    doc.moveDown(0.5);

    const data = [
      ["Nama", warga.nama],
      ["Tempat, Tanggal Lahir", warga.tglLahir ? `-, ${formatDateId(warga.tglLahir)}` : "-"],
      ["Jenis Kelamin", warga.jk === "L" ? "Laki-laki" : "Perempuan"],
      ["NIK", warga.nik],
      ["No. KK", warga.nkk ?? "-"],
      ["Pekerjaan", warga.pekerjaan ?? "-"],
      ["Agama", warga.agama ?? "-"],
      ["Status Tinggal", warga.statusTinggal],
      ["Alamat", `RT ${get("nama_rt")} / RW ${get("nama_rw")}, No. Rumah ${warga.noRumah ?? "-"}`],
    ];

    for (const [label, value] of data) {
      doc.text(`${label.padEnd(20)}: ${value}`);
      doc.moveDown(0.1);
    }

    doc.moveDown(0.4);
    doc.text(`Orang tersebut di atas adalah benar warga RT ${get("nama_rt")} / RW ${get("nama_rw")} Kelurahan ${get("kelurahan")} ${get("kecamatan")} Kota ${get("kota")}.`);
    doc.moveDown(0.3);
    doc.text(`Surat keterangan ini dibuat atas permintaan yang bersangkutan untuk keperluan: ${surat.keperluan}.`);
    doc.moveDown(0.3);
    doc.text("Demikian surat keterangan ini dibuat agar dapat dipergunakan sebagaimana mestinya.");
    doc.moveDown(1.5);

    const width = 535 - 60;
    doc.font(FONT, 11).text(`${get("kota")}, ${tanggal}`, { width, align: "left" });
    doc.text("Ketua RT " + get("nama_rt"), { align: "left" });
    doc.moveDown(2.5);
    doc.text("( " + get("nama_ketua") + " )", { align: "left" });

    doc.end();
  });

  return new Response(new Blob([buffer], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="surat-${surat.noSurat ?? surat.id}.pdf"`,
    },
  });
}

function formatDateId(value: string) {
  const [y, m, d] = value.split("-");
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${d} ${months[Number(m) - 1]} ${y}`;
}
