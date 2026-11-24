// ============================================================
// KONFIGURASI DATABASE MySQL — Tahap A
// ------------------------------------------------------------
// Memakai connection pool (bukan createConnection) agar banyak request
// bisa dilayani secara bersamaan tanpa membuka koneksi baru terus.
// Konfigurasi dibaca dari server/config/env.js.
// ============================================================

import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { config } from './env.js';

// TLS hanya dipakai jika DB_SSL=true. Koneksi lokal tetap tanpa TLS.
const opsiSsl = !config.database.ssl
  ? undefined
  : {
      rejectUnauthorized: true,
      ...(config.database.sslCa ? { ca: fs.readFileSync(config.database.sslCa, 'utf8') } : {}),
    };

// Membuat pool koneksi. Kredensial berasal dari .env, bukan source code.
const db = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit,
  queueLimit: 0,
  ...(opsiSsl ? { ssl: opsiSsl } : {}),
  // Tanggal dari MySQL dikembalikan sebagai string 'YYYY-MM-DD'
  // agar formatnya konsisten dengan frontend.
  dateStrings: true,
});

// ============================================================
// PEMERIKSAAN KONEKSI
// Dipakai saat server start dan oleh endpoint /api/db-check.
// ============================================================
export async function cekKoneksiDatabase() {
  try {
    await db.query('SELECT 1');
    return { ok: true, database: config.database.name };
  } catch (error) {
    // Pesan teknis hanya untuk log server, tidak dikirim ke client.
    console.error('[DB] Koneksi gagal:', error.code || error.message);
    return { ok: false, database: config.database.name };
  }
}

// ============================================================
// PENUTUPAN POOL
// Dipakai saat proses server dihentikan (graceful shutdown).
// ============================================================
export async function tutupKoneksiDatabase() {
  await db.end();
}

// Default export adalah satu-satunya cara route/controller mengakses pool;
// helper bernama di atas dipakai untuk health check dan shutdown.
export default db;
