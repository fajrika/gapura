CREATE TYPE "public"."jk" AS ENUM('L', 'P');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'pengurus', 'warga');--> statement-breakpoint
CREATE TYPE "public"."status_keluhan" AS ENUM('baru', 'diproses', 'selesai');--> statement-breakpoint
CREATE TYPE "public"."status_laporan" AS ENUM('baru', 'ditangani', 'selesai');--> statement-breakpoint
CREATE TYPE "public"."status_ronda" AS ENUM('menunggu', 'hadir', 'tidak');--> statement-breakpoint
CREATE TYPE "public"."status_surat" AS ENUM('pending', 'disetujui', 'ditolak', 'selesai');--> statement-breakpoint
CREATE TYPE "public"."status_tagihan" AS ENUM('belum', 'lunas');--> statement-breakpoint
CREATE TYPE "public"."status_tinggal" AS ENUM('tetap', 'kontrak', 'sewa', 'kos');--> statement-breakpoint
CREATE TYPE "public"."tipe_transaksi" AS ENUM('masuk', 'keluar');--> statement-breakpoint
CREATE TABLE "agendas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "agendas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"judul" varchar(255) NOT NULL,
	"tanggal" date NOT NULL,
	"jam" time,
	"tempat" varchar(255),
	"keterangan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arisan_anggota" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "arisan_anggota_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"arisan_id" integer NOT NULL,
	"warga_id" integer NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"dibayar" boolean DEFAULT false NOT NULL,
	"dicairkan" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "arisan_anggota_unique" UNIQUE("arisan_id","warga_id")
);
--> statement-breakpoint
CREATE TABLE "arisan_pencairan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "arisan_pencairan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"arisan_id" integer NOT NULL,
	"warga_id" integer NOT NULL,
	"tanggal" date DEFAULT now() NOT NULL,
	"nominal" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arisans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "arisans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" varchar(255) NOT NULL,
	"iuran" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iuran" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "iuran_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" varchar(255) NOT NULL,
	"jumlah" numeric(14, 2) NOT NULL,
	"periode" varchar(20) DEFAULT 'bulanan' NOT NULL,
	"hitung_per" varchar(20) DEFAULT 'kk' NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jadwal_rundas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jadwal_rundas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tanggal" date NOT NULL,
	"warga_id" integer NOT NULL,
	"shift" varchar(20) DEFAULT 'Malam' NOT NULL,
	"status" "status_ronda" DEFAULT 'menunggu' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kegiatans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kegiatans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"judul" varchar(255) NOT NULL,
	"tanggal" date NOT NULL,
	"tempat" varchar(255),
	"keterangan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kehadirans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kehadirans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kegiatan_id" integer NOT NULL,
	"warga_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kehadiran_unique" UNIQUE("kegiatan_id","warga_id")
);
--> statement-breakpoint
CREATE TABLE "keluhans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "keluhans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"warga_id" integer NOT NULL,
	"kategori" varchar(100) DEFAULT 'lain' NOT NULL,
	"isi" text NOT NULL,
	"status" "status_keluhan" DEFAULT 'baru' NOT NULL,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laporan_kejadiians" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "laporan_kejadiians_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tanggal" date NOT NULL,
	"jam" time,
	"warga_id" integer,
	"jenis" varchar(255) DEFAULT 'Lainnya' NOT NULL,
	"isi" text NOT NULL,
	"tindak_lanjut" text,
	"status" "status_laporan" DEFAULT 'baru' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengumumans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pengumumans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"judul" varchar(255) NOT NULL,
	"isi" text NOT NULL,
	"author_id" integer,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "push_subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"endpoint" text NOT NULL,
	"keys_p256dh" text NOT NULL,
	"keys_auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "surat_pengajuans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "surat_pengajuans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"warga_id" integer NOT NULL,
	"jenis" varchar(255) NOT NULL,
	"keperluan" text NOT NULL,
	"status" "status_surat" DEFAULT 'pending' NOT NULL,
	"no_surat" varchar(100),
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tagihan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tagihan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"iuran_id" integer NOT NULL,
	"warga_id" integer NOT NULL,
	"periode" varchar(7) NOT NULL,
	"jumlah" numeric(14, 2) NOT NULL,
	"status" "status_tagihan" DEFAULT 'belum' NOT NULL,
	"tanggal_bayar" timestamp with time zone,
	"metode" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tagihan_unique" UNIQUE("iuran_id","warga_id","periode")
);
--> statement-breakpoint
CREATE TABLE "transaksis" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transaksis_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tipe" "tipe_transaksi" NOT NULL,
	"kategori" varchar(100) DEFAULT 'lain' NOT NULL,
	"jumlah" numeric(14, 2) NOT NULL,
	"keterangan" text,
	"warga_id" integer,
	"tanggal" date DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'warga' NOT NULL,
	"phone" varchar(20),
	"warga_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wargas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wargas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nkk" varchar(20),
	"nik" varchar(20) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"jk" "jk" DEFAULT 'L' NOT NULL,
	"tgl_lahir" date,
	"agama" varchar(50),
	"pekerjaan" varchar(100),
	"status_tinggal" "status_tinggal" DEFAULT 'tetap' NOT NULL,
	"no_rumah" varchar(20),
	"telepon" varchar(20),
	"is_kepala_keluarga" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wargas_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
ALTER TABLE "arisan_anggota" ADD CONSTRAINT "arisan_anggota_arisan_id_arisans_id_fk" FOREIGN KEY ("arisan_id") REFERENCES "public"."arisans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arisan_anggota" ADD CONSTRAINT "arisan_anggota_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arisan_pencairan" ADD CONSTRAINT "arisan_pencairan_arisan_id_arisans_id_fk" FOREIGN KEY ("arisan_id") REFERENCES "public"."arisans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arisan_pencairan" ADD CONSTRAINT "arisan_pencairan_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_rundas" ADD CONSTRAINT "jadwal_rundas_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kehadirans" ADD CONSTRAINT "kehadirans_kegiatan_id_kegiatans_id_fk" FOREIGN KEY ("kegiatan_id") REFERENCES "public"."kegiatans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kehadirans" ADD CONSTRAINT "kehadirans_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keluhans" ADD CONSTRAINT "keluhans_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan_kejadiians" ADD CONSTRAINT "laporan_kejadiians_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengumumans" ADD CONSTRAINT "pengumumans_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surat_pengajuans" ADD CONSTRAINT "surat_pengajuans_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_iuran_id_iuran_id_fk" FOREIGN KEY ("iuran_id") REFERENCES "public"."iuran"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksis" ADD CONSTRAINT "transaksis_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_warga_id_wargas_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."wargas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "surat_status_idx" ON "surat_pengajuans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tagihan_periode_idx" ON "tagihan" USING btree ("periode");--> statement-breakpoint
CREATE INDEX "tagihan_status_idx" ON "tagihan" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "wargas_nik_idx" ON "wargas" USING btree ("nik");--> statement-breakpoint
CREATE INDEX "wargas_nkk_idx" ON "wargas" USING btree ("nkk");--> statement-breakpoint
CREATE INDEX "wargas_norumah_idx" ON "wargas" USING btree ("no_rumah");