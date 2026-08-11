import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  time,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "pengurus", "warga", "security"]);
export const jkEnum = pgEnum("jk", ["L", "P"]);
export const statusTinggalEnum = pgEnum("status_tinggal", [
  "tetap",
  "kontrak",
  "sewa",
  "kos",
]);
export const statusTagihanEnum = pgEnum("status_tagihan", [
  "belum",
  "lunas",
]);
export const tipeTransaksiEnum = pgEnum("tipe_transaksi", ["masuk", "keluar"]);
export const statusSuratEnum = pgEnum("status_surat", [
  "pending",
  "disetujui",
  "ditolak",
  "selesai",
]);
export const statusRondaEnum = pgEnum("status_ronda", [
  "menunggu",
  "hadir",
  "tidak",
]);
export const statusLaporanEnum = pgEnum("status_laporan", [
  "baru",
  "ditangani",
  "selesai",
]);
export const statusKeluhanEnum = pgEnum("status_keluhan", [
  "baru",
  "diproses",
  "selesai",
]);
export const statusPanggilanEnum = pgEnum("status_panggilan", [
  "dipanggil",
  "selesai",
]);

export const rumahs = pgTable(
  "rumahs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nomor: varchar("nomor", { length: 20 }).notNull().unique(),
    blok: varchar("blok", { length: 20 }),
    alamat: text("alamat"),
    posX: numeric("pos_x", { precision: 6, scale: 2 }).notNull().default("0"),
    posY: numeric("pos_y", { precision: 6, scale: 2 }).notNull().default("0"),
    vaNumber: varchar("va_number", { length: 40 }).unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("rumahs_nomor_idx").on(t.nomor)],
);

export const wargas = pgTable(
  "wargas",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nkk: varchar("nkk", { length: 20 }),
    nik: varchar("nik", { length: 20 }).notNull().unique(),
    nama: varchar("nama", { length: 255 }).notNull(),
    jk: jkEnum("jk").notNull().default("L"),
    tglLahir: date("tgl_lahir"),
    agama: varchar("agama", { length: 50 }),
    pekerjaan: varchar("pekerjaan", { length: 100 }),
    statusTinggal: statusTinggalEnum("status_tinggal").notNull().default("tetap"),
    noRumah: varchar("no_rumah", { length: 20 }),
    rumahId: integer("rumah_id").references(() => rumahs.id, {
      onDelete: "set null",
    }),
    telepon: varchar("telepon", { length: 20 }),
    isKepalaKeluarga: boolean("is_kepala_keluarga").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("wargas_nik_idx").on(t.nik),
    index("wargas_nkk_idx").on(t.nkk),
    index("wargas_norumah_idx").on(t.noRumah),
  ],
);

export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: roleEnum("role").notNull().default("warga"),
    phone: varchar("phone", { length: 20 }),
    wargaId: integer("warga_id").references(() => wargas.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const iuran = pgTable("iuran", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: varchar("nama", { length: 255 }).notNull(),
  jumlah: numeric("jumlah", { precision: 14, scale: 2 }).notNull(),
  periode: varchar("periode", { length: 20 }).notNull().default("bulanan"),
  hitungPer: varchar("hitung_per", { length: 20 }).notNull().default("kk"),
  aktif: boolean("aktif").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tagihan = pgTable(
  "tagihan",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    iuranId: integer("iuran_id")
      .notNull()
      .references(() => iuran.id, { onDelete: "cascade" }),
    wargaId: integer("warga_id")
      .notNull()
      .references(() => wargas.id, { onDelete: "cascade" }),
    periode: varchar("periode", { length: 7 }).notNull(),
    jumlah: numeric("jumlah", { precision: 14, scale: 2 }).notNull(),
    status: statusTagihanEnum("status").notNull().default("belum"),
    tanggalBayar: timestamp("tanggal_bayar", { withTimezone: true }),
    metode: varchar("metode", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("tagihan_unique").on(t.iuranId, t.wargaId, t.periode),
    index("tagihan_periode_idx").on(t.periode),
    index("tagihan_status_idx").on(t.status),
  ],
);

export const transaksis = pgTable("transaksis", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tipe: tipeTransaksiEnum("tipe").notNull(),
  kategori: varchar("kategori", { length: 100 }).notNull().default("lain"),
  jumlah: numeric("jumlah", { precision: 14, scale: 2 }).notNull(),
  keterangan: text("keterangan"),
  wargaId: integer("warga_id").references(() => wargas.id, {
    onDelete: "set null",
  }),
  tanggal: date("tanggal").notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pengumumans = pgTable("pengumumans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  judul: varchar("judul", { length: 255 }).notNull(),
  isi: text("isi").notNull(),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const agendas = pgTable("agendas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  judul: varchar("judul", { length: 255 }).notNull(),
  tanggal: date("tanggal").notNull(),
  jam: time("jam"),
  tempat: varchar("tempat", { length: 255 }),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const suratPengajuans = pgTable(
  "surat_pengajuans",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    wargaId: integer("warga_id")
      .notNull()
      .references(() => wargas.id, { onDelete: "cascade" }),
    jenis: varchar("jenis", { length: 255 }).notNull(),
    keperluan: text("keperluan").notNull(),
    status: statusSuratEnum("status").notNull().default("pending"),
    noSurat: varchar("no_surat", { length: 100 }),
    catatan: text("catatan"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("surat_status_idx").on(t.status)],
);

export const jadwalRundas = pgTable("jadwal_rundas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tanggal: date("tanggal").notNull(),
  wargaId: integer("warga_id")
    .notNull()
    .references(() => wargas.id, { onDelete: "cascade" }),
  shift: varchar("shift", { length: 20 }).notNull().default("Malam"),
  status: statusRondaEnum("status").notNull().default("menunggu"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const laporanKejadiians = pgTable("laporan_kejadiians", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tanggal: date("tanggal").notNull(),
  jam: time("jam"),
  wargaId: integer("warga_id").references(() => wargas.id, {
    onDelete: "set null",
  }),
  jenis: varchar("jenis", { length: 255 }).notNull().default("Lainnya"),
  isi: text("isi").notNull(),
  tindakLanjut: text("tindak_lanjut"),
  status: statusLaporanEnum("status").notNull().default("baru"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const keluhans = pgTable("keluhans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  wargaId: integer("warga_id")
    .notNull()
    .references(() => wargas.id, { onDelete: "cascade" }),
  kategori: varchar("kategori", { length: 100 }).notNull().default("lain"),
  isi: text("isi").notNull(),
  status: statusKeluhanEnum("status").notNull().default("baru"),
  catatan: text("catatan"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const kegiatans = pgTable("kegiatans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  judul: varchar("judul", { length: 255 }).notNull(),
  tanggal: date("tanggal").notNull(),
  tempat: varchar("tempat", { length: 255 }),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const kehadirans = pgTable(
  "kehadirans",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kegiatanId: integer("kegiatan_id")
      .notNull()
      .references(() => kegiatans.id, { onDelete: "cascade" }),
    wargaId: integer("warga_id")
      .notNull()
      .references(() => wargas.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("kehadiran_unique").on(t.kegiatanId, t.wargaId)],
);

export const arisans = pgTable("arisans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: varchar("nama", { length: 255 }).notNull(),
  iuran: numeric("iuran", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const arisanAnggota = pgTable(
  "arisan_anggota",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    arisanId: integer("arisan_id")
      .notNull()
      .references(() => arisans.id, { onDelete: "cascade" }),
    wargaId: integer("warga_id")
      .notNull()
      .references(() => wargas.id, { onDelete: "cascade" }),
    urutan: integer("urutan").notNull().default(0),
    dibayar: boolean("dibayar").notNull().default(false),
    dicairkan: boolean("dicairkan").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("arisan_anggota_unique").on(t.arisanId, t.wargaId)],
);

export const arisanPencairan = pgTable("arisan_pencairan", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  arisanId: integer("arisan_id")
    .notNull()
    .references(() => arisans.id, { onDelete: "cascade" }),
  wargaId: integer("warga_id")
    .notNull()
    .references(() => wargas.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull().defaultNow(),
  nominal: numeric("nominal", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  endpoint: text("endpoint").notNull().unique(),
  keysP256dh: text("keys_p256dh").notNull(),
  keysAuth: text("keys_auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
});

export const securityCalls = pgTable(
  "security_calls",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    callerUserId: integer("caller_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    callerWargaId: integer("caller_warga_id").references(() => wargas.id, {
      onDelete: "set null",
    }),
    status: statusPanggilanEnum("status").notNull().default("dipanggil"),
    respondedByUserId: integer("responded_by_user_id").references(
      () => users.id,
      { onDelete: "set null" },
    ),
    selesaiAt: timestamp("selesai_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("security_calls_status_idx").on(t.status)],
);

export const cameras = pgTable("cameras", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nama: varchar("nama", { length: 255 }).notNull(),
  lokasi: varchar("lokasi", { length: 255 }),
  rtspUrl: text("rtsp_url").notNull(),
  onvifHost: varchar("onvif_host", { length: 255 }),
  onvifPort: integer("onvif_port").notNull().default(8000),
  onvifUsername: varchar("onvif_username", { length: 100 }),
  onvifPassword: varchar("onvif_password", { length: 255 }),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Warga = typeof wargas.$inferSelect;
export type NewWarga = typeof wargas.$inferInsert;
export type Rumah = typeof rumahs.$inferSelect;
export type Camera = typeof cameras.$inferSelect;
export type SecurityCall = typeof securityCalls.$inferSelect;
export type Tagihan = typeof tagihan.$inferSelect;
export type Transaksi = typeof transaksis.$inferSelect;
export type Pengumuman = typeof pengumumans.$inferSelect;
export type SuratPengajuan = typeof suratPengajuans.$inferSelect;
export type JadwalRonda = typeof jadwalRundas.$inferSelect;
export type LaporanKejadian = typeof laporanKejadiians.$inferSelect;
export type Keluhan = typeof keluhans.$inferSelect;
export type Kegiatan = typeof kegiatans.$inferSelect;
export type Arisan = typeof arisans.$inferSelect;
