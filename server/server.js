// ============================================================
// ENTRY POINT BACKEND BROOKIES — Tahap A
// ------------------------------------------------------------
// File ini hanya merakit aplikasi: config, middleware, routes,
// dan penanganan error. Logika bisnis ada di folder controllers.
// ============================================================

import express from 'express';
import cors from 'cors';

// Config terpusat (sudah memuat .env tepat satu kali).
import { config, validasiConfigServer } from './config/env.js';
import { cekKoneksiDatabase, tutupKoneksiDatabase } from './config/database.js';

// Middleware error, keamanan, dan pembatas percobaan login.
import { routeTidakDitemukan, penangananError } from './middleware/errorHandler.js';
import { headerKeamanan } from './middleware/security.js';
import { ApiError } from './utils/apiError.js';

// Seluruh router API (autentikasi + data operasional + laporan).
import authRoutes from './routes/auth.js';
import bahanRouter from './routes/bahan.js';
import resepRouter from './routes/resep.js';
import transaksiRouter from './routes/transaksi.js';
import pengeluaranRouter from './routes/pengeluaran.js';
import produksiRouter from './routes/produksi.js';
import laporanRouter from './routes/laporan.js';

// Pastikan konfigurasi wajib ada sebelum server berjalan.
try {
  validasiConfigServer();
} catch (error) {
  console.error(`[CONFIG] ${error.message}`);
  process.exit(1);
}

if (!process.env.NODE_ENV) {
  console.warn('[CONFIG] NODE_ENV belum diset. Gunakan NODE_ENV=production saat deploy.');
}

const app = express();

// ============================================================
// MIDDLEWARE GLOBAL
// ============================================================

app.disable('x-powered-by');
// Render meneruskan alamat klien melalui X-Forwarded-For (satu hop proxy).
app.set('trust proxy', 1);
app.use(headerKeamanan);

// CORS: hanya frontend yang tercantum di CORS_ORIGIN yang boleh mengakses.
// Bisa diisi beberapa origin dengan dipisah koma di .env.
const daftarOrigin = config.corsOrigin.split(',').map((item) => item.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Request tanpa origin (misalnya curl / health check) tetap diizinkan.
    if (!origin || daftarOrigin.includes(origin)) return callback(null, true);
    return callback(new ApiError(403, 'Origin tidak diizinkan oleh CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Membaca body JSON dari frontend.
app.use(express.json({ limit: '1mb' }));

// ============================================================
// ROUTE PUBLIK / HEALTH CHECK
// ============================================================

// Penanda sederhana bahwa backend aktif.
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Brookies aktif!',
  });
});

// Pemeriksaan koneksi MySQL tanpa menampilkan kredensial.
app.get('/api/db-check', async (req, res) => {
  const hasil = await cekKoneksiDatabase();

  res.status(hasil.ok ? 200 : 503).json({
    success: hasil.ok,
    status: hasil.ok ? 'connected' : 'error',
    message: hasil.ok ? 'Layanan siap.' : 'Layanan sedang tidak tersedia.',
  });
});

// ============================================================
// ROUTE API
// ============================================================

// Autentikasi admin (login, cek sesi).
app.use('/api/auth', authRoutes);

// Enam router data operasional di bawah dilindungi JWT (Tahap B).
// Dua endpoint publik (/api dan /api/db-check) sudah dipasang lebih awal.
app.use('/api/bahan', bahanRouter);
app.use('/api/resep', resepRouter);
app.use('/api/transaksi', transaksiRouter);
app.use('/api/pengeluaran', pengeluaranRouter);
app.use('/api/produksi', produksiRouter);
app.use('/api/laporan', laporanRouter);

// ============================================================
// FALLBACK & ERROR HANDLER
// Harus dipasang setelah seluruh route.
// ============================================================
app.use(routeTidakDitemukan);
app.use(penangananError);

// ============================================================
// START SERVER
// ============================================================
const server = app.listen(config.port, async () => {
  console.log(`Backend Brookies berjalan di http://localhost:${config.port}`);

  // Cek koneksi saat start agar masalah database segera terlihat.
  const hasil = await cekKoneksiDatabase();
  // Nama database sengaja tidak dicetak, termasuk di log hosting.
  console.log(hasil.ok
    ? '[DB] Koneksi database berhasil.'
    : '[DB] PERINGATAN: koneksi database gagal.');
});

// Menutup pool koneksi dengan rapi saat proses dihentikan.
function hentikanServer() {
  server.close(async () => {
    await tutupKoneksiDatabase();
    console.log('[SERVER] Proses dihentikan, koneksi database ditutup.');
    process.exit(0);
  });
}

process.on('SIGINT', hentikanServer);
process.on('SIGTERM', hentikanServer);
