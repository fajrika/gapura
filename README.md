# Aplikasi RT/RW — Next.js PWA

Aplikasi manajemen RT/RW berbasis web (mobile-first PWA) untuk warga, pengurus, dan admin:
data warga & KK, iuran & kas, pengumuman, agenda, pengajuan surat (PDF), jadwal ronda,
laporan kejadian, keluhan, kegiatan (daftar hadir), arisan, dan notifikasi push.

Repo: https://github.com/fajrika/rtrw

## Teknologi

- **Next.js 16** (App Router) + TypeScript
- **Drizzle ORM** + **PostgreSQL 16+** (compatible 18)
- **Tailwind CSS 4** + lucide-react
- **PWA**: manifest, service worker, offline shell, install prompt, Web Push (VAPID)
- **Auth**: session JWT (jose) + bcrypt, cookie httpOnly, role `admin`/`pengurus`/`warga`
- **PDF surat**: pdfkit (font DejaVu)
- **Docker**: multi-stage build + `docker-compose.yml` (app + postgres + migrasi otomatis)

## Jalankan dengan Docker (cara tercepat)

```bash
# siapkan env (opsional; nilai default sudah dipakai compose)
cp .env.example .env

# build + jalankan semua (db postgres:18 + migrasi + app di port 3003)
docker compose up -d --build

# seed data contoh (sekali saja)
npm run seed
```

Setelah itu buka http://localhost:3003

- DB PostgreSQL tersedia di `localhost:5433` (container `rtrw-db`), data tersimpan di volume `rtrw_pgdata`.
- Migrasi jalan otomatis sekali sebelum app start (service `migrate`), memakai `migrate.mjs` + folder `drizzle/`.
- Restart/menjalankan ulang: `docker compose up -d`.
- Log: `docker compose logs -f app`.

## Setup lokal (tanpa Docker)

1. Install dependencies: `npm install`
2. Salin `.env.example` ke `.env` dan isi.
3. Jalankan PostgreSQL (contoh via Docker):
   ```bash
   docker run -d --name rtrw-db -e POSTGRES_USER=rtrw -e POSTGRES_PASSWORD=rtrw_secret \
     -e POSTGRES_DB=rtrw -p 5433:5432 -v rtrw-pgdata:/var/lib/postgresql postgres:18-alpine
   ```
4. Generate & jalankan migrasi:
   ```bash
   npm run db:generate
   npm run db:migrate   # atau npm run db:push untuk dev
   ```
5. Seed data contoh & akun: `npm run seed`
   - Admin: `admin@rtrw.local` / `admin123`
   - Pengurus: `pengurus@rtrw.local` / `pengurus123`
   - Warga: `warga@rtrw.local` / `warga123`
6. Jalankan dev: `npm run dev` (port 3000, atau 3003 bila 3000 terpakai)

## Notifikasi Push

- Generate pasangan kunci VAPID: `npx web-push generate-vapid-keys`
- Isi `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_KEY` di `.env`
- `NEXT_PUBLIC_*` wajib diset saat **build** (untuk Docker: lewat `build.args` di compose); kunci server cukup di env saat **runtime**.
- User mengaktifkan notifikasi di halaman **Pengaturan** → Notifikasi
- Pengumuman & kegiatan baru otomatis mengirim push ke semua subscriber

## Modul & Route

| Modul | Route | Role |
|---|---|---|
| Dashboard | `/dashboard` | semua |
| Warga & KK | `/warga`, `/warga/[id]`, `/warga/new`, `/warga/[id]/edit` | lihat: semua; kelola: admin/pengurus |
| Iuran & Tagihan | `/iuran` | semua (warga: tagihan sendiri) |
| Kas & Laporan | `/kas`, `/kas/export?month=YYYY-MM` | kelola: admin/pengurus |
| Pengumuman | `/pengumuman` | semua (tulis: admin/pengurus) |
| Agenda | `/agenda` | semua (tulis: admin/pengurus) |
| Surat | `/surat`, `/surat/[id]/pdf` | semua (ajukan: warga/terhubung) |
| Ronda | `/ronda` | semua (kelola: admin/pengurus) |
| Kejadian | `/kejadian` | semua |
| Keluhan | `/keluhan` | semua |
| Kegiatan | `/kegiatan` | semua (presensi: warga) |
| Arisan | `/arisan` | semua (kelola: admin/pengurus) |
| Pengaturan | `/pengaturan` | semua |
| Profil | `/profil` | semua |

## Dockerfile & Compose

- **Dockerfile** — 3 stage: `deps` (npm ci), `builder` (next build, output standalone), `runner` (node:22-alpine + `ttf-dejavu` untuk font PDF). Menyalin `migrate.mjs` + `drizzle/` + paket `drizzle-orm` & `postgres` (di-bundle Next, jadi disalin terpisah untuk migrasi).
- **docker-compose.yml** — 3 service:
  - `db`: `postgres:18-alpine`, port host 5433, healthcheck `pg_isready`, volume `rtrw_pgdata`
  - `migrate`: jalankan `node migrate.mjs` sekali, menunggu `db` healthy; app menunggu migrate selesai
  - `app`: build dari Dockerfile, port host 3003 → container 3000
- Variabel compose bisa di-override lewat `.env` di root repo (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `VAPID_*`, `NEXT_PUBLIC_*`).

## Deploy ke Coolify / VPS

1. Git push ke GitHub (repo `fajrika/rtrw`).
2. Di Coolify: buat resource **Docker Compose** (atau app Next.js dengan build pack Nixpacks) dari repo.
3. Sediakan domain/subdomain HTTPS (wajib untuk push notification).
4. Set env produksi di Coolify (sama seperti `.env.example`, `DATABASE_URL` menunjuk ke PostgreSQL produksi).
5. Build & deploy. App listen di port 3000 di dalam container.

## Scripts

| Script | Fungsi |
|---|---|
| `npm run dev` | dev server (port 3000; memakai 3003 bila 3000 dipakai) |
| `npm run build` / `start` | build & run produksi |
| `npm run lint` | eslint |
| `npm run db:generate` | generate migrasi Drizzle |
| `npm run db:push` | push skema ke DB (dev) |
| `npm run db:migrate` | jalankan migrasi (drizzle-kit, butuh devDeps) |
| `npm run db:migrate:run` | jalankan migrasi (runtime, `migrate.mjs` — dipakai di Docker) |
| `npm run seed` | seed data contoh |
