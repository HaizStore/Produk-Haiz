# Haiz Store — Full Vercel

Satu project Next.js (TypeScript) yang jalan 100% di Vercel:
- Halaman toko + panel admin (React/Next.js)
- API backend-nya jadi **API Routes** Next.js (`src/app/api/**`) — bukan Go
  lagi, supaya bisa nempel di Vercel sepenuhnya
- Data produk/config/admin disimpan di **Upstash Redis** — database
  key-value gratis **permanen** (bukan yang expired 30 hari), terintegrasi
  langsung dari dashboard Vercel

Kenapa butuh Upstash padahal katanya "full Vercel"? Karena Vercel sendiri
tidak punya disk permanen (serverless), jadi data harus disimpan di database
eksternal. Upstash ini tetap bagian dari ekosistem Vercel (dipasang lewat
tab **Storage** di project Vercel kamu, 2 klik, gratis, tanpa kartu kredit)
— cuma bukan Vercel yang "menyimpan" datanya secara fisik.

---

## 1. Jalan di lokal

```bash
npm install
cp .env.example .env.local
```

Isi `.env.local`:
1. `ADMIN_JWT_SECRET` → hasil `openssl rand -hex 32`
2. `ADMIN_USERNAME` / `ADMIN_PASSWORD` → login admin kamu
3. `KV_REST_API_URL` / `KV_REST_API_TOKEN` → daftar gratis di
   [console.upstash.com](https://console.upstash.com) → Create Database →
   copy "REST API" URL & token

```bash
npm run dev
```

Buka `http://localhost:3000` (toko) dan `http://localhost:3000/admin/login`
(admin).

---

## 2. Deploy ke Vercel (full, satu project)

1. Push folder ini ke GitHub.
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. **Sebelum klik Deploy**, buka tab **Storage** di project → **Create
   Database** → pilih **Upstash → Redis** → pilih region **Singapore**
   (paling dekat Indonesia) → Create. Vercel otomatis mengisi env var
   `KV_REST_API_URL` dan `KV_REST_API_TOKEN` ke project kamu.
4. Di tab **Environment Variables**, tambahkan manual:
   - `ADMIN_JWT_SECRET` = hasil `openssl rand -hex 32`
   - `ADMIN_USERNAME` = username admin kamu
   - `ADMIN_PASSWORD` = password admin yang kuat
5. Klik **Deploy**.
6. Selesai — satu URL Vercel untuk toko + admin + API, semuanya gratis dan
   permanen selama masih dalam batas gratis Upstash (10rb command/hari, lebih
   dari cukup untuk toko kecil).

Setelah live, langsung login ke `/admin/login`, lalu ganti password dari
tab "Ganti Password" di dashboard.

---

## 3. Cara pakai panel admin

- `/admin/login` → login pakai `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- Tab **Produk**: tambah/edit/hapus produk, atur stok, harga, deskripsi,
  aktif/nonaktifkan tampil di toko — perubahan langsung tersimpan permanen
  di Redis, tidak akan hilang meski Vercel redeploy
- Tab **Pengaturan Toko**: nomor WhatsApp, link Linktree, gambar QRIS,
  gambar maskot, pengumuman beranda
- Tab **Ganti Password**

Gambar produk/QRIS/maskot: sudah ada di `public/images/` (`produk1.png`,
`produk2.png`, `mascot.png`, `qris.png`). Di form admin isi field gambar
dengan `/images/nama-file.png`, atau pakai link gambar dari host lain kalau
tidak mau redeploy tiap ganti gambar.

---

## 4. Keamanan yang diterapkan

- Password admin di-hash pakai `scrypt` (built-in Node.js, bukan plaintext)
- Sesi admin pakai token bertanda tangan HMAC dengan masa berlaku 12 jam,
  disimpan di `sessionStorage` (hilang saat tab ditutup)
- Rate limit login: maksimal 5 percobaan/menit per IP (disimpan di Redis,
  jadi konsisten walau serverless function-nya pindah instance)
- Semua endpoint admin (`/api/admin/**`) wajib `Authorization: Bearer <token>`
  yang valid
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) via `next.config.js`
- Validasi input di semua endpoint admin
- Pembeli **tidak perlu login sama sekali**

### Sebelum go-live:
1. Jangan commit `.env.local` (sudah di `.gitignore`)
2. Pakai `ADMIN_PASSWORD` yang kuat, bukan contoh
3. Generate `ADMIN_JWT_SECRET` sendiri, jangan dikira-kira
4. Setelah deploy pertama, langsung ganti password dari dashboard admin
5. Update nomor WhatsApp di tab Pengaturan Toko (sekarang masih placeholder)

---

## 5. Batas gratis Upstash Redis

Free tier Upstash: 10.000 command/hari, 256MB storage, tidak ada expired.
Untuk toko dengan beberapa produk dan traffic kecil-menengah, ini jauh lebih
dari cukup — tiap kali orang buka halaman toko itu ~1-2 command Redis saja.
