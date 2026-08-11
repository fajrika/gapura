import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  wargas,
  iuran,
  tagihan,
  transaksis,
  pengumumans,
  agendas,
  suratPengajuans,
  jadwalRundas,
  keluhans,
  kegiatans,
  kehadirans,
  arisans,
  arisanAnggota,
  settings,
  laporanKejadiians,
} from "./schema";
import { hashPassword } from "@/lib/auth";

async function main() {
  console.log("Seeding...");

  const inDays = (offset: number) =>
    new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

  await db.execute(
    sql`TRUNCATE TABLE users, wargas, iuran, tagihan, transaksis, pengumumans, agendas, surat_pengajuans, jadwal_rundas, laporan_kejadiians, keluhans, kegiatans, kehadirans, arisans, arisan_anggota, arisan_pencairan, push_subscriptions, settings RESTART IDENTITY CASCADE`,
  );

  const adminPassword = await hashPassword("admin123");
  const pengurusPassword = await hashPassword("pengurus123");
  const wargaPassword = await hashPassword("warga123");

  await db.insert(users).values([
    {
      name: "Admin RT",
      email: "admin@rtrw.local",
      passwordHash: adminPassword,
      role: "admin",
      phone: "081234567890",
    },
    {
      name: "Pengurus RT",
      email: "pengurus@rtrw.local",
      passwordHash: pengurusPassword,
      role: "pengurus",
      phone: "081234567891",
    },
  ]);

  const wargaData = [
    {
      nkk: "3578010101000001",
      nik: "3578010101000001",
      nama: "Budi Santoso",
      jk: "L" as const,
      tglLahir: "1980-01-15",
      agama: "Islam",
      pekerjaan: "Wiraswasta",
      statusTinggal: "tetap" as const,
      noRumah: "01",
      telepon: "081234567892",
      isKepalaKeluarga: true,
    },
    {
      nkk: "3578010101000001",
      nik: "3578010101000002",
      nama: "Siti Rahayu",
      jk: "P" as const,
      tglLahir: "1983-05-20",
      agama: "Islam",
      pekerjaan: "Ibu Rumah Tangga",
      statusTinggal: "tetap" as const,
      noRumah: "01",
      telepon: "081234567893",
      isKepalaKeluarga: false,
    },
    {
      nkk: "3578010101000002",
      nik: "3578010101000003",
      nama: "Agus Wijaya",
      jk: "L" as const,
      tglLahir: "1975-11-02",
      agama: "Kristen",
      pekerjaan: "PNS",
      statusTinggal: "tetap" as const,
      noRumah: "02",
      telepon: "081234567894",
      isKepalaKeluarga: true,
    },
    {
      nkk: "3578010101000003",
      nik: "3578010101000004",
      nama: "Dewi Lestari",
      jk: "P" as const,
      tglLahir: "1990-03-12",
      agama: "Islam",
      pekerjaan: "Karyawan Swasta",
      statusTinggal: "sewa" as const,
      noRumah: "03",
      telepon: "081234567895",
      isKepalaKeluarga: true,
    },
    {
      nkk: "3578010101000004",
      nik: "3578010101000005",
      nama: "Joko Susilo",
      jk: "L" as const,
      tglLahir: "1968-07-30",
      agama: "Islam",
      pekerjaan: "Petani",
      statusTinggal: "tetap" as const,
      noRumah: "04",
      telepon: "081234567896",
      isKepalaKeluarga: true,
    },
    {
      nkk: "3578010101000005",
      nik: "3578010101000006",
      nama: "Rina Puspita",
      jk: "P" as const,
      tglLahir: "1995-09-09",
      agama: "Hindu",
      pekerjaan: "Guru",
      statusTinggal: "kontrak" as const,
      noRumah: "05",
      telepon: "081234567897",
      isKepalaKeluarga: true,
    },
  ];

  await db.insert(wargas).values(wargaData);

  const admin = (await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, "admin@rtrw.local"),
  }))!;

  const warga = (await db.query.wargas.findFirst({
    where: (w, { eq }) => eq(w.nik, "3578010101000001"),
  }))!;

  await db.insert(users).values({
    name: "Budi Santoso",
    email: "warga@rtrw.local",
    passwordHash: wargaPassword,
    role: "warga",
    phone: warga.telepon,
    wargaId: warga.id,
  });

  const iuranBulanan = await db
    .insert(iuran)
    .values({ nama: "Iuran Bulanan", jumlah: "50000", periode: "bulanan" })
    .returning();

  await db.insert(tagihan).values([
    {
      iuranId: iuranBulanan[0].id,
      wargaId: warga.id,
      periode: "2026-08",
      jumlah: "50000",
      status: "belum",
    },
    {
      iuranId: iuranBulanan[0].id,
      wargaId: warga.id,
      periode: "2026-07",
      jumlah: "50000",
      status: "lunas",
      tanggalBayar: new Date("2026-07-05T08:00:00Z"),
      metode: "Tunai",
    },
  ]);

  await db.insert(transaksis).values([
    {
      tipe: "masuk",
      kategori: "iuran",
      jumlah: "300000",
      keterangan: "Iuran bulan Juli - 6 KK",
      tanggal: "2026-07-05",
    },
    {
      tipe: "keluar",
      kategori: "kebersihan",
      jumlah: "75000",
      keterangan: "Pembayaran petugas kebersihan",
      tanggal: "2026-07-10",
    },
    {
      tipe: "masuk",
      kategori: "donasi",
      jumlah: "200000",
      keterangan: "Donasi warga",
      tanggal: "2026-07-20",
    },
  ]);

  await db.insert(pengumumans).values([
    {
      judul: "Kerja Bakti Minggu Ini",
      isi: "Kerja bakti membersihkan selokan akan dilaksanakan hari Minggu pukul 07.00 WIB. Diharapkan setiap KK mengirimkan 1 orang perwakilan.",
      authorId: admin.id,
      pinned: true,
    },
    {
      judul: "Pengumuman Iuran Bulan Agustus",
      isi: "Iuran bulanan bulan Agustus sebesar Rp 50.000 per KK. Pembayaran dapat dilakukan melalui bendahara RT.",
      authorId: admin.id,
    },
  ]);

  await db.insert(agendas).values([
    {
      judul: "Rapat Warga Bulanan",
      tanggal: inDays(5),
      jam: "19:30",
      tempat: "Balai RT",
      keterangan: "Agenda: evaluasi kegiatan dan rencana 17 Agustus.",
    },
    {
      judul: "Kerja Bakti",
      tanggal: inDays(3),
      jam: "07:00",
      tempat: "Sepanjang gang RT",
      keterangan: "Membersihkan selokan dan pekarangan.",
    },
  ]);

  await db.insert(suratPengajuans).values([
    {
      wargaId: warga.id,
      jenis: "Surat Pengantar",
      keperluan: "Pengajuan KTP",
      status: "pending",
    },
  ]);

  const kepalaWargas = wargaData.filter((w) => w.isKepalaKeluarga);
  await db.insert(jadwalRundas).values(
    kepalaWargas.map((_, i) => ({
      tanggal: inDays(i + 1),
      wargaId: i + 1,
      shift: i % 2 === 0 ? "Malam" : "Subuh",
    })),
  );

  await db.insert(laporanKejadiians).values([
    {
      tanggal: new Date().toISOString().slice(0, 10),
      jam: "21:30",
      wargaId: warga.id,
      jenis: "Keamanan",
      isi: "Motor warga hilang di depan gang.",
      status: "baru",
    },
  ]);

  await db.insert(keluhans).values([
    {
      wargaId: warga.id,
      kategori: "kebersihan",
      isi: "Tempat sampah di ujung gang penuh dan tidak diangkut.",
      status: "baru",
    },
  ]);

  const kegiatan = await db
    .insert(kegiatans)
    .values({
      judul: "17 Agustus-an",
      tanggal: inDays(15),
      tempat: "Lapangan RT",
      keterangan: "Lomba-lomba dan tumpeng.",
    })
    .returning();

  await db.insert(kehadirans).values({ kegiatanId: kegiatan[0].id, wargaId: warga.id });

  const arisan = await db
    .insert(arisans)
    .values({ nama: "Arisan Ibu-Ibu RT", iuran: "50000" })
    .returning();

  await db.insert(arisanAnggota).values(
    kepalaWargas.map((_, i) => ({
      arisanId: arisan[0].id,
      wargaId: i + 1,
      urutan: i + 1,
    })),
  );

  await db.insert(settings).values([
    { key: "nama_rt", value: "RT 01" },
    { key: "nama_rw", value: "RW 05" },
    { key: "kelurahan", value: "Kelurahan Contoh" },
    { key: "kecamatan", value: "Kecamatan Contoh" },
    { key: "kota", value: "Surabaya" },
    { key: "alamat_kantor", value: "Balai RT 01, Jl. Melati No. 1" },
    { key: "nama_ketua", value: "Budi Santoso" },
  ]);

  console.log("Seeding selesai.");
  console.log("Login: admin@rtrw.local / admin123 | pengurus@rtrw.local / pengurus123 | warga@rtrw.local / warga123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
