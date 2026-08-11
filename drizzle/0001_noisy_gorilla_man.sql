CREATE TYPE "public"."status_panggilan" AS ENUM('dipanggil', 'selesai');--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'security';--> statement-breakpoint
CREATE TABLE "cameras" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cameras_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" varchar(255) NOT NULL,
	"lokasi" varchar(255),
	"rtsp_url" text NOT NULL,
	"onvif_host" varchar(255),
	"onvif_port" integer DEFAULT 8000 NOT NULL,
	"onvif_username" varchar(100),
	"onvif_password" varchar(255),
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rumahs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rumahs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nomor" varchar(20) NOT NULL,
	"blok" varchar(20),
	"alamat" text,
	"pos_x" numeric(6, 2) DEFAULT '0' NOT NULL,
	"pos_y" numeric(6, 2) DEFAULT '0' NOT NULL,
	"va_number" varchar(40),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rumahs_nomor_unique" UNIQUE("nomor"),
	CONSTRAINT "rumahs_va_number_unique" UNIQUE("va_number")
);
--> statement-breakpoint
CREATE TABLE "security_calls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "security_calls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"caller_user_id" integer,
	"caller_warga_id" integer,
	"status" "status_panggilan" DEFAULT 'dipanggil' NOT NULL,
	"responded_by_user_id" integer,
	"selesai_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wargas" ADD COLUMN "rumah_id" integer;--> statement-breakpoint
ALTER TABLE "security_calls" ADD CONSTRAINT "security_calls_caller_user_id_users_id_fk" FOREIGN KEY ("caller_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_calls" ADD CONSTRAINT "security_calls_caller_warga_id_wargas_id_fk" FOREIGN KEY ("caller_warga_id") REFERENCES "public"."wargas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_calls" ADD CONSTRAINT "security_calls_responded_by_user_id_users_id_fk" FOREIGN KEY ("responded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rumahs_nomor_idx" ON "rumahs" USING btree ("nomor");--> statement-breakpoint
CREATE INDEX "security_calls_status_idx" ON "security_calls" USING btree ("status");--> statement-breakpoint
ALTER TABLE "wargas" ADD CONSTRAINT "wargas_rumah_id_rumahs_id_fk" FOREIGN KEY ("rumah_id") REFERENCES "public"."rumahs"("id") ON DELETE set null ON UPDATE no action;