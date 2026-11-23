// ============================================================
// KONFIGURASI LINGKUNGAN (ENVIRONMENT) — Tahap A
// ------------------------------------------------------------
// File ini satu-satunya tempat membaca file .env.
// Tujuannya: menghindari dotenv.config() dipanggil berkali-kali
// dengan path berbeda (masalah di server.js lama).
// Path .env diambil relatif dari file ini, sehingga tetap benar
// meski aplikasi dijalankan dari folder lain.
// ============================================================

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Lokasi folder server/config → naik dua level ke root proyek.
const rootProyek = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// quiet: true mencegah dotenv mencetak ringkasan variabel ke console.
dotenv.config({ path: path.join(rootProyek, '.env'), quiet: true });

// ============================================================
// OBJEK KONFIGURASI
// Nilai default hanya untuk pengembangan lokal.
// Kredensial atau secret TIDAK boleh ditulis di sini.
// ============================================================
export const config = {
  // Port Express; default 3000 seperti sebelumnya.
  port: Number(process.env.PORT || 3000),

  // Konfigurasi koneksi MySQL (dibaca dari .env).
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'brookies_db',
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },

  // JWT dipakai untuk menandatangani token login admin.
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  // CORS dibatasi hanya ke alamat frontend yang diizinkan.
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Data admin hanya dipakai oleh seedAdmin.js, bukan oleh API.
  admin: {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
    nama: process.env.ADMIN_NAME || 'Administrator',
  },
};

// ============================================================
// VALIDASI KONFIGURASI SAAT STARTUP
// Fail-fast: lebih baik server berhenti dengan pesan jelas
// daripada berjalan dengan JWT_SECRET kosong.
// ============================================================
export function validasiConfigServer() {
  const masalah = [];

  if (!config.database.name) masalah.push('DB_NAME belum diisi di .env');
  if (!config.jwt.secret) masalah.push('JWT_SECRET belum diisi di .env');

  if (masalah.length) {
    throw new Error(`Konfigurasi server tidak lengkap: ${masalah.join('; ')}`);
  }
}

// Validation khusus untuk script seed admin.
export function validasiConfigAdmin() {
  const masalah = [];

  if (!config.admin.username) masalah.push('ADMIN_USERNAME belum diisi di .env');
  if (!config.admin.password) masalah.push('ADMIN_PASSWORD belum diisi di .env');

  if (masalah.length) {
    throw new Error(`Konfigurasi admin tidak lengkap: ${masalah.join('; ')}`);
  }
}
