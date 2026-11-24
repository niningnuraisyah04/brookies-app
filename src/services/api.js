// ============================================================
// LAYANAN API BROOKIES — Tahap E
// ------------------------------------------------------------
// Satu tempat untuk semua komunikasi frontend ↔ backend.
// Setiap request otomatis menyertakan token JWT (kecuali login).
// Semua data operasional berasal dari MySQL melalui endpoint ini.
// ============================================================

import { ambilToken, hapusToken, simpanToken } from './storage';

const API_URL_DARI_ENV = typeof import.meta.env.VITE_API_URL === 'string'
  ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '')
  : '';

const PESAN_KONFIGURASI_API =
  'VITE_API_URL belum diisi. Tambahkan environment variable VITE_API_URL ' +
  'pada pengaturan build frontend (misalnya https://backend-anda.onrender.com), lalu build ulang.';

// Development tetap bisa memakai backend lokal tanpa menyetel env var.
// Production tidak punya fallback: konfigurasi yang hilang harus terlihat jelas.
const BASE_URL = (() => {
  if (API_URL_DARI_ENV) return API_URL_DARI_ENV;
  if (import.meta.env.DEV) return 'http://localhost:3000';
  console.error(`[KONFIGURASI] ${PESAN_KONFIGURASI_API}`);
  return '';
})();

// Penanda 401: callback dipasang App.jsx agar state login ikut logout.
// Flag mencegah callback dipanggil berulang saat beberapa request gagal bersamaan.
let penangan401 = null;
let sesiBerakhir = false;

export function aturPenangan401(fn) { penangan401 = fn; }
// Error dari API menyimpan status HTTP agar pemanggil bisa membedakan
// kegagalan autentikasi (401) dari kegagalan koneksi (status 0).
function gagalApi(pesan, status) {
  const err = new Error(pesan);
  err.status = status;
  return err;
}
function tangani401() {
  hapusToken();
  if (sesiBerakhir) return;
  sesiBerakhir = true;
  if (typeof penangan401 === 'function') penangan401();
}

// ============================================================
// PEMBUNGKU FETCH
// ============================================================
async function permintaan(path, { method = 'GET', body, auth = true } = {}) {
  if (!BASE_URL) throw gagalApi(PESAN_KONFIGURASI_API, 0);

  const header = { 'Content-Type': 'application/json' };

  // Token dikirim hanya untuk endpoint yang memerlukan autentikasi.
  if (auth) {
    const token = ambilToken();
    if (token) header.Authorization = `Bearer ${token}`;
  }

  let respons;
  try {
    respons = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: header,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw gagalApi('Tidak dapat terhubung ke server. Pastikan backend Brookies berjalan.', 0);
  }

  let hasil;
  try {
    hasil = await respons.json();
  } catch {
    throw gagalApi('Respons server tidak dikenali.', 0);
  }

  if (!respons.ok) {
    // Hanya 401 yang boleh mengakhiri sesi; error lain tidak boleh logout.
    if (respons.status === 401 && auth) tangani401();
    throw gagalApi(hasil.message || `Permintaan gagal (${respons.status}).`, respons.status);
  }

  return hasil;
}

// ============================================================
// DAFTAR ENDPOINT
// ============================================================
export const api = {
  // Autentikasi — token disimpan setelah login berhasil.
  login: async (username, password) => {
    const hasil = await permintaan('/api/auth/login', {
      method: 'POST', body: { username, password }, auth: false,
    });
    simpanToken(hasil.token);
    sesiBerakhir = false; // login baru menandai sesi aktif kembali
    return hasil;
  },
  cekSesi: () => permintaan('/api/auth/me'),

  // Bahan baku
  daftarBahan: () => permintaan('/api/bahan'),
  simpanBahan: (id, data) => permintaan(id ? `/api/bahan/${encodeURIComponent(id)}` : '/api/bahan', {
    method: id ? 'PUT' : 'POST', body: data,
  }),
  hapusBahan: (id) => permintaan(`/api/bahan/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Resep
  daftarResep: () => permintaan('/api/resep'),
  simpanResep: (id, data) => permintaan(id ? `/api/resep/${id}` : '/api/resep', {
    method: id ? 'PUT' : 'POST', body: data,
  }),
  hapusResep: (id) => permintaan(`/api/resep/${id}`, { method: 'DELETE' }),

  // Transaksi
  daftarTransaksi: () => permintaan('/api/transaksi'),
  simpanTransaksi: (id, data) => permintaan(id ? `/api/transaksi/${encodeURIComponent(id)}` : '/api/transaksi', {
    method: id ? 'PUT' : 'POST', body: data,
  }),
  hapusTransaksi: (id) => permintaan(`/api/transaksi/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Pengeluaran
  daftarPengeluaran: () => permintaan('/api/pengeluaran'),
  simpanPengeluaran: (id, data) => permintaan(id ? `/api/pengeluaran/${encodeURIComponent(id)}` : '/api/pengeluaran', {
    method: id ? 'PUT' : 'POST', body: data,
  }),
  hapusPengeluaran: (id) => permintaan(`/api/pengeluaran/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Produksi
  daftarProduksi: () => permintaan('/api/produksi'),
  simpanProduksi: (id, data) => permintaan(id ? `/api/produksi/${encodeURIComponent(id)}` : '/api/produksi', {
    method: id ? 'PUT' : 'POST', body: data,
  }),
  hapusProduksi: (id) => permintaan(`/api/produksi/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Dashboard & laporan
  dashboard: (tahun = new Date().getFullYear()) => permintaan(`/api/laporan/dashboard?tahun=${tahun}`),
  laporan: (tahun = new Date().getFullYear()) => permintaan(`/api/laporan/keuntungan?tahun=${tahun}`),
};

export default api;
