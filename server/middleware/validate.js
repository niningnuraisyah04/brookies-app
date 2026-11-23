// ============================================================
// VALIDASI INPUT API — Tahap B
// ------------------------------------------------------------
// Validasi sederhana tanpa dependency baru. Setiap validator
// mengembalikan nilai yang sudah dibersihkan ke `req.dataValid`,
// sehingga controller tidak perlu memercayai req.body mentah.
// ============================================================

import { badRequest } from '../utils/apiError.js';

// Melempar error lokal yang nantinya dikumpulkan per field.
const gagal = (pesan) => { throw new Error(pesan); };

// ------------------------------------------------------------
// VALIDATOR DASAR
// ------------------------------------------------------------

// Teks wajib, dipangkas spasinya, dengan batas panjang.
export const teks = (label, { min = 1, max = 255 } = {}) => (nilai) => {
  if (nilai === undefined || nilai === null) gagal(`${label} wajib diisi.`);
  const hasil = String(nilai).trim();
  if (hasil.length < min) gagal(`${label} minimal ${min} karakter.`);
  if (hasil.length > max) gagal(`${label} maksimal ${max} karakter.`);
  return hasil;
};

// Angka dengan batas minimum/maksimum opsional.
export const angka = (label, { min = -Infinity, max = Infinity, bulat = false } = {}) => (nilai) => {
  if (nilai === undefined || nilai === null || nilai === '') gagal(`${label} wajib diisi.`);
  const hasil = Number(nilai);
  if (!Number.isFinite(hasil)) gagal(`${label} harus berupa angka.`);
  if (bulat && !Number.isInteger(hasil)) gagal(`${label} harus berupa bilangan bulat.`);
  if (hasil < min) gagal(`${label} minimal ${min}.`);
  if (hasil > max) gagal(`${label} maksimal ${max}.`);
  return hasil;
};

// Tanggal format YYYY-MM-DD (sesuai kolom DATE di MySQL).
export const tanggal = (label) => (nilai) => {
  if (!nilai) gagal(`${label} wajib diisi.`);
  const hasil = String(nilai).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hasil)) gagal(`${label} harus berformat YYYY-MM-DD.`);
  if (Number.isNaN(Date.parse(`${hasil}T00:00:00Z`))) gagal(`${label} tidak valid.`);
  return hasil;
};

// Nilai harus salah satu dari daftar yang diizinkan.
export const pilihan = (label, daftar) => (nilai) => {
  const hasil = teks(label)(nilai);
  if (!daftar.includes(hasil)) gagal(`${label} harus salah satu dari: ${daftar.join(', ')}.`);
  return hasil;
};

// Membungkus validator agar boleh kosong; memakai nilai default.
export const opsional = (validator, nilaiDefault = null) => (nilai) => {
  if (nilai === undefined || nilai === null || nilai === '') return nilaiDefault;
  return validator(nilai);
};

// ------------------------------------------------------------
// MIDDLEWARE PEMBUNGKUS
// ------------------------------------------------------------
// Contoh:
//   validasiBody({ nama: teks('Nama'), stok: angka('Stok', { min: 0 }) })
export function validasiBody(skema) {
  return (req, res, next) => {
    const body = req.body || {};
    const hasil = {};
    const masalah = [];

    for (const [field, validator] of Object.entries(skema)) {
      try {
        hasil[field] = validator(body[field]);
      } catch (error) {
        masalah.push(`${field}: ${error.message}`);
      }
    }

    if (masalah.length) {
      return next(badRequest(`Input tidak valid (${masalah.join(' ')})`));
    }

    // Controller memakai data yang sudah divalidasi, bukan body mentah.
    req.dataValid = hasil;
    next();
  };
}
