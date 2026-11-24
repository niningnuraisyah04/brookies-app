# Dokumentasi Perubahan — Website Manajemen Usaha Brookies

Tanggal: 21 November 2026 (diperbarui 23 November 2026 — Tahap 15A, 15B & Tahap 7)

## 1. Ringkasan

Seluruh data operasional (transaksi, pengeluaran, produksi, bahan baku, resep,
dashboard, dan laporan) sekarang **tersimpan di MySQL** melalui backend Express.
`localStorage` tidak lagi dipakai untuk data usaha — hanya untuk token JWT sesi
login admin.

Perubahan dilakukan bertahap dan diuji setelah setiap tahap:

| Tahap | Fokus | Status |
| --- | --- | --- |
| A | Konfigurasi backend, koneksi MySQL, CORS, error handler | Selesai, diuji |
| B | Autentikasi JWT, validasi input, proteksi API | Selesai, diuji |
| C/D | Endpoint transaksi, pengeluaran, produksi, dashboard, laporan + sinkron stok | Selesai, diuji |
| E | Frontend memakai API, loading/error/success, envelope response | Selesai, diuji |
| 15A | Identitas visual: token warna/font terpusat, kelas semantik, tampilan publik & admin | Selesai, disetujui |
| 15B | Audit & penataan source code, dokumentasi empat struktur data (tanpa perubahan perilaku) | Selesai, diuji |
| 15C | Dokumentasi teknis: peta source code, alur aplikasi, CRUD, dan peta backend | Selesai (dokumentasi saja) |
| 7 | Perbaikan keamanan & kesiapan deployment (URL API, rate limit, header, TLS opsional, error handling) | Selesai, diuji |

Desain dan fitur existing dipertahankan. Konsep struktur data tugas tetap ada:
Array/List, Hash Map, Tree, dan Bubble Sort. Penjelasan lengkapnya ada di
[`DOKUMENTASI_STRUKTUR_DATA.md`](./DOKUMENTASI_STRUKTUR_DATA.md).

Peta menyeluruh struktur folder, file penting, alur Browser → Backend → MySQL,
alur CRUD, dan panduan menemukan kode ada di
[`PETA_SOURCE_CODE.md`](./PETA_SOURCE_CODE.md).

## 2. Perubahan Database

- Migrasi `server/migrations/001_tambah_kolom_produk.js` menambahkan **satu kolom
  nullable** `produk varchar(100)` pada tabel `transaksi` (disetujui pengguna).
- Migrasi **idempotent**: kolom dicek melalui `INFORMATION_SCHEMA` sebelum `ALTER`.
- Tidak ada tabel dihapus, kolom diganti nama, data direset, atau data uji dibiarkan.
- Cara menjalankan: `npm run migrate`.
- Jumlah baris setelah pengujian: `admin` 1, `bahan_baku` 27, `resep` 108,
  `transaksi` 0, `pengeluaran` 0, `produksi` 0 (sama seperti sebelum perubahan).

### Sinkronisasi stok otomatis

- Pengeluaran kategori `Bahan Baku`: stok bertambah saat dicatat, dikurangi saat
  dihapus, dan disesuaikan saat diubah.
- Produksi: stok bahan berkurang sesuai resep dan jumlah batch, dikembalikan saat
  catatan dihapus atau diubah.
- Semua perubahan stok + catatan berada dalam **satu transaksi MySQL**
  (`BEGIN` → `COMMIT` / `ROLLBACK`) dan memakai `SELECT ... FOR UPDATE` agar aman
  saat ada request bersamaan.

## 3. Daftar Perubahan File

### Backend — konfigurasi & infrastruktur

| File | Perubahan |
| --- | --- |
| `server/config/env.js` | Baru. Memuat `.env` sekali (`dotenv.config(..., { quiet: true })`), validasi variabel wajib, `config.corsOrigin`, `config.jwt.secret`. Nilai rahasia tidak pernah dicetak. |
| `server/config/database.js` | Diperbarui. Pool `mysql2/promise`, `cekKoneksiDatabase()`, `tutupKoneksiDatabase()`. |
| `server/server.js` | Diperbarui. CORS dari `CORS_ORIGIN`, health check, mount seluruh router, fallback 404, error handler terpusat, shutdown pool DB yang rapi. |
| `server/utils/apiError.js` | Baru. `ApiError`, `badRequest`, `unauthorized`, `notFound`, `conflict`, `asyncHandler`. |
| `server/middleware/errorHandler.js` | Baru. `routeTidakDitemukan`, `penangananError`, terjemahan kode error MySQL (duplikat/FK) ke pesan aman. |
| `server/middleware/auth.js` | Baru. Verifikasi `Authorization: Bearer <token>`, pesan 401 generik, detail JWT tidak dibocorkan. |
| `server/middleware/validate.js` | Baru. `validasiBody`, `teks`, `angka`, `tanggal`, `pilihan`, `opsional`. |
| `package.json` | Ditambah script `migrate`. |

### Backend — autentikasi & data master

| File | Perubahan |
| --- | --- |
| `server/routes/auth.js` | Baru. `POST /login` (bcrypt + JWT) dan `GET /me`. Password/hash tidak pernah dikirim ke client. |
| `server/routes/bahan.js` | Diperbarui. Semua method butuh JWT + validasi + envelope `{ success, data/message }`. |
| `server/routes/resep.js` | Diperbarui. Semua method butuh JWT + validasi + envelope. |

### Backend — fitur baru (Tahap C/D)

| File | Perubahan |
| --- | --- |
| `server/controllers/transaksiController.js` | Baru. CRUD transaksi + mapping `DECIMAL` → number + filter tanggal/saluran/status. |
| `server/routes/transaksi.js` | Baru. Endpoint terproteksi dengan validasi saluran & status. |
| `server/controllers/pengeluaranController.js` | Baru. CRUD pengeluaran + penyesuaian stok bahan dalam transaksi DB. Total bahan dihitung server. |
| `server/routes/pengeluaran.js` | Baru. Validasi lanjutan per kategori (`Bahan Baku` / `Operasional`). |
| `server/controllers/produksiController.js` | Baru. CRUD produksi, baca resep, cek & kurangi/kembalikan stok secara atomik. |
| `server/routes/produksi.js` | Baru. Endpoint terproteksi; jumlah hasil dihitung server dari resep. |
| `server/controllers/laporanController.js` | Baru. Ringkasan dashboard (kartu, grafik 12 bulan, saluran, stok menipis) dan laporan hierarkis. |
| `server/routes/laporan.js` | Baru. `GET /dashboard` dan `GET /keuntungan`. |
| `server/migrations/001_tambah_kolom_produk.js` | Baru. Migrasi nullable `transaksi.produk`. |

### Frontend

| File | Perubahan |
| --- | --- |
| `src/services/storage.js` | Ditulis ulang. Hanya menyimpan/membaca/menghapus token JWT (`brookies_token`). Tidak ada lagi data usaha di `localStorage`. |
| `src/services/api.js` | Baru. Satu tempat semua `fetch`, menyisipkan token, membongkar envelope, pesan error aman, login menyimpan token, 401 menghapus token. Alamat backend dari `VITE_API_URL` (default `http://localhost:3000`). |
| `src/App.jsx` | Diperbarui. Data dimuat dari API setelah login (`Promise.all` 7 endpoint), refresh setelah setiap mutasi, loading indicator, toast sukses/gagal, kartu & grafik dashboard memakai data MySQL, Tree laporan memakai data API, logout membersihkan state. |
| `.env.example` | Ditambah `VITE_API_URL` (contoh tanpa nilai rahasia). |
| `.gitignore` | Diperbarui agar `.env` tidak ikut ter-commit. |

Modul lama `src/structures/arrayList.js`, `src/structures/hashMap.js`,
`src/structures/tree.js`, dan `src/algorithms/bubbleSort.js` **sengaja dipertahankan**
(komentar di `App.jsx` menjelaskan perannya). File data master lama juga dibiarkan
meski tidak lagi dipakai sebagai sumber data utama.

Pada Tahap 15B keempat modul tersebut **tidak diubah algoritmanya** — hanya
ditambah komentar header bertema `STRUKTUR DATA:`/`ALGORITMA:` dan JSDoc
ringkas. Rincian tujuan, operasi, lokasi pemanggilan, dan kompleksitas aktual
ada di [`DOKUMENTASI_STRUKTUR_DATA.md`](./DOKUMENTASI_STRUKTUR_DATA.md).

## 4. Daftar Endpoint API

Base URL: `http://localhost:3000` (atau sesuai `VITE_API_URL`).

Semua endpoint di bawah **memerlukan header**
`Authorization: Bearer <token>` kecuali yang ditandai *publik*.

Respons GET: `{ "success": true, "data": ... }`
Respons mutasi: `{ "success": true, "message": "...", "data": ... }`
Respons gagal: `{ "success": false, "message": "..." }`

### Publik

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api` | Health check backend. |
| GET | `/api/db-check` | Status koneksi MySQL (nama DB tanpa kredensial). |
| POST | `/api/auth/login` | Body `{ username, password }` → `{ token, admin: { id, username, nama } }`. |

### Autentikasi (butuh token)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/auth/me` | Data admin dari token. |

### Bahan baku & resep (butuh token)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET/POST | `/api/bahan` | Daftar / tambah bahan. Body: `id, nama, stok, satuan, minimum, kebutuhanBulanan, hargaBahan`. |
| PUT/DELETE | `/api/bahan/:id` | Ubah / hapus bahan. |
| GET/POST | `/api/resep` | Daftar / tambah resep. Body: `produk, id_bahan, jumlah, satuan, hasil_per_batch`. |
| PUT/DELETE | `/api/resep/:id` | Ubah / hapus resep. |

### Transaksi (butuh token)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/transaksi` | Daftar. Query opsional: `tanggal_mulai`, `tanggal_selesai`, `saluran`, `status`. |
| GET | `/api/transaksi/:id` | Detail. |
| POST | `/api/transaksi` | Body `id, tanggal, saluran, produk, jumlahProduk, total, status`. |
| PUT | `/api/transaksi/:id` | Body sama tanpa `id`. |
| DELETE | `/api/transaksi/:id` | Hapus. |

Saluran: `WhatsApp`, `Instagram`, `GrabFood`, `GoFood`, `Penitipan Kafe`, `CFD`, `Langsung`.
Status: `Diterima`, `Diproses`, `Selesai`, `Dibatalkan`. Pendapatan hanya dihitung
dari transaksi berstatus `Selesai`.

### Pengeluaran (butuh token)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/pengeluaran` | Daftar. Query opsional: `tanggal_mulai`, `tanggal_selesai`, `kategori`. |
| GET | `/api/pengeluaran/:id` | Detail. |
| POST | `/api/pengeluaran` | Body `id, tanggal, kategori, nama, total, idBahan, jumlahBeli, satuan, hargaSatuan`. |
| PUT | `/api/pengeluaran/:id` | Body sama. |
| DELETE | `/api/pengeluaran/:id` | Hapus + stok bahan dikembalikan. |

Kategori: `Bahan Baku` (wajib `idBahan`, `jumlahBeli > 0`, `hargaSatuan > 0`,
`satuan`; `total` dihitung server) atau `Operasional` (wajib `total > 0`, field
bahan dikosongkan).

### Produksi (butuh token)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/produksi` | Daftar. Query opsional: `tanggal_mulai`, `tanggal_selesai`, `produk`. |
| GET | `/api/produksi/:id` | Detail. |
| POST | `/api/produksi` | Body `id, tanggal, produk, jumlahBatch`. Stok & `jumlahHasil` dihitung server dari resep. |
| PUT | `/api/produksi/:id` | Body sama; stok lama dikembalikan lalu stok baru diterapkan. |
| DELETE | `/api/produksi/:id` | Hapus + stok dikembalikan. |

### Dashboard & laporan (butuh token)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/laporan/dashboard?tahun=2026` | Kartu ringkasan, 12 bulan pendapatan/pengeluaran, saluran, stok menipis, transaksi terbaru. |
| GET | `/api/laporan/keuntungan?tahun=2026` | Data laporan. Bisa juga `?tanggal_mulai=...&tanggal_selesai=...`. Mengembalikan `periode`, `ringkasan`, `transaksi[]`, `pengeluaran[]` untuk dibangun menjadi Tree di frontend. |

## 5. Hasil Pengujian

- `npm run lint` → **0 error**. Satu warning bawaan (`src/components/ui/button.jsx`,
  aturan Fast Refresh) sudah ada sebelum perubahan dan tidak terkait fitur ini.
- `npm run build` → **berhasil** (Vite, 2895 modul).
- API tanpa token → 401 dengan pesan aman; dengan token → 200 envelope.
- Login salah → 401; validasi bahan/transaksi gagal → 400.
- CRUD transaksi, pengeluaran, produksi → 201/200; detail & filter → 200.
- Stok BH-007 bertambah saat pembelian, menyesuaikan saat edit, kembali saat hapus.
- Stok BH-001 berkurang 250 gram saat 1 batch `Original`, kembali saat hapus.
- Dashboard → 12 bulan; laporan → array transaksi/pengeluaran.
- Semua data uji dibersihkan; jumlah baris database kembali seperti semula.
- File uji sementara (`.audit-api.mjs`, `.audit-db.mjs`, `.audit-crud.mjs`) sudah dihapus.

## 6. Catatan Operasional

- Menjalankan backend: `npm run server` (nodemon), frontend: `npm run dev` (Vite).
- Menjalankan migrasi: `npm run migrate` (aman diulang).
- PowerShell memblokir `npm` langsung; gunakan `cmd /c "npm run <script>"`.
- Isi `.env` tidak pernah ditampilkan dalam dokumentasi maupun log. Gunakan
  `.env.example` sebagai referensi nama variabel.
- Jika frontend tidak bisa terhubung, pastikan backend aktif dan `VITE_API_URL`
  sesuai dengan alamat backend.

## 7. Tahap 15B — Audit & Penataan Source Code

Tahap 15B bersifat **dokumentasi-first**. Tidak ada file yang dipindah, tidak ada
endpoint/DB schema/auth/business logic yang diubah, dan desain Tahap 15A tetap
menjadi baseline visual.

### Yang ditambahkan

- `DOKUMENTASI_STRUKTUR_DATA.md` — panduan lengkap empat struktur data beserta
  peta modul, lokasi pemanggilan, dan urutan membaca.
- Komentar header + JSDoc di `arrayList.js`, `hashMap.js`, `tree.js`, dan
  `bubbleSort.js`. Komentar menjelaskan kode yang benar-benar ada (misalnya
  Hash Map memakai `Map` native, Tree bukan binary, Bubble Sort tanpa early exit).
- Daftar lengkap titik pemanggilan ada di dokumen struktur data. Komentar
  kontekstual di `crud.js`, `useAppData.js`, `useDerivedData.js`, `Resep.jsx`,
  `Laporan.jsx`, `BahanBaku.jsx`, `Pengeluaran.jsx`, dan `Transaksi.jsx`
  sudah ada sejak tahap sebelumnya dan sengaja dipertahankan; Tahap 15B
  menambah satu catatan Hash Map di `EntityModal.jsx`.
- Alias token `--surface` dan `--footer` di `src/index.css` untuk aturan lama di
  `App.css` (nilai warna tetap sama dengan token Tahap 15A).

### Perapian kecil (tanpa perubahan perilaku)

- Nama fungsi default `Header` → `AdminHeader`, `Sidebar` → `AdminSidebar`
  agar sama dengan nama file.
- Ternary `kind === 'bahan' ? 'bahan' : kind` di `tableHelpers.jsx` disederhanakan
  menjadi `kind` (hasilnya memang identik).
- Paragraf kosong di `LoginModal.jsx` dihapus.
- Penjelasan singkat untuk utilitas `cn` di `lib/utils.js` (dipertahankan, bukan
  dihapus).
- Empat komentar backend diperbaiki agar sesuai kode aktual: dua header endpoint
  di `laporanController.js` (`/api/laporan/dashboard` dan `/api/laporan/keuntungan`),
  catatan usang "route lama" di `config/database.js`, dan klarifikasi endpoint
  publik di `server.js`. Tidak ada baris kode backend yang berubah.

### Hasil audit & pengujian 15B

- Import: 66 file JS/JSX di `src/` dan `server/` — **0 import rusak, 0 siklus**
  (`tahap15b_import_audit.mjs`).
- `npm run lint` → 0 error; `npm run build` → berhasil.
- Struktur data: 21 assertion lulus (`tahap15b_structures_full.mjs`), plus
  `tahap13_structures.mjs` dan `tahap11_arraylist.mjs`.
- Visual: sweep desktop & mobile untuk halaman publik, katalog, dan 7 halaman
  admin → tidak ada overflow, tidak ada exception JS.
- Regresi backend: auth, CRUD transaksi/pengeluaran/bahan/produksi, sinkron stok,
  snapshot resep terkunci — **lolos**; dijalankan di `PORT=3100` dengan
  `DB_NAME=brookies_db_test`, bukan database utama.
- Sidik tabel sebelum/sesudah pengujian identik; `brookies_db` utama tidak
  mengalami operasi tulis. Audit binlog: seluruh `Table_map` untuk `brookies_db`
  terjadi pukul **15:07:35** (temuan Tahap 14, sebelum 15B); tidak ada event
  setelahnya. Event 15B seluruhnya masuk ke `brookies_db_test` (terakhir
  16:10:52).

## 7. Tahap 7 — Perbaikan Keamanan & Kesiapan Deployment

Perubahan bersifat minimal dan tidak mengubah fitur, desain, struktur data,
database, atau nilai `.env`.

| File | Perubahan |
| --- | --- |
| `src/services/api.js` | Fallback `localhost:3000` hanya saat `import.meta.env.DEV`. Production tanpa `VITE_API_URL` menampilkan pesan konfigurasi yang jelas. |
| `vite.config.js` | Plugin build menghapus `ekspor-localstorage.html` dari hasil build; file sumber tetap ada untuk dev server. |
| `server/middleware/rateLimit.js` | Baru. Pembatas 5 percobaan login per IP per 15 menit, respons generik + `Retry-After`. |
| `server/middleware/security.js` | Baru. Header `nosniff`, `DENY`, `no-referrer`, COOP, Permissions-Policy, dan HSTS hanya saat produksi. |
| `server/server.js` | `X-Powered-By` dinonaktifkan, `trust proxy` diatur, header keamanan dipasang, `/api/db-check` tidak lagi menampilkan nama database, log start tidak menyebut nama database. |
| `server/config/env.js` | Opsi `DB_SSL` / `DB_SSL_CA`; validasi fail-fast jika `NODE_ENV=production` memakai JWT placeholder. |
| `server/config/database.js` | TLS MySQL opsional dan eksplisit; koneksi lokal tetap tanpa TLS. |
| `server/routes/auth.js` | Dummy `bcrypt.compare` saat username tidak ditemukan untuk menyamakan timing; pembatas login dipasang. |
| `server/middleware/errorHandler.js` | Detail error internal tidak pernah dikirim ke client, terlepas dari `NODE_ENV`. |
| `.env.example` | Mendokumentasikan `DB_SSL`, `DB_SSL_CA`, `NODE_ENV`, dan kewajiban `VITE_API_URL` saat build produksi. |

### Hasil pengujian Tahap 7

- `npm run lint` (oxlint): **0 error**. ESLint tidak terpasang di proyek; oxlint adalah linter yang dikonfigurasi.
- Build production: berhasil, 30 file; `ekspor-localstorage.html` tidak ikut; `localhost:3000` tidak ada di bundle; pesan konfigurasi tampak jika env kosong; env dummy terpakai sebagai URL aktif.
- `npm audit --omit=dev`: **0 kerentanan**.
- Backend uji di `PORT=3200` dengan `DB_NAME=brookies_demo_db` dan `NODE_ENV=production`: **30/30 pemeriksaan lulus** (health, header, CORS, db-check, auth, seluruh endpoint GET, validasi, rate limit 401→429, timing, 157 baris).
- Database utama dan demo tetap **157 baris**; `.env` tidak diubah; tidak ada commit/push/deploy.

### Masih memerlukan konfigurasi hosting

- Netlify: `VITE_API_URL` (wajib, tersedia saat build), Node 22.
- Render: `NODE_ENV=production`, `JWT_SECRET` baru (milik pemilik), `DB_*` dari MySQL terkelola, `DB_SSL=true` bila didukung, `CORS_ORIGIN` domain Netlify, health check `/api`.
