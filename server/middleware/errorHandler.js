// ============================================================
// PENANGANAN ERROR TERPUSAT — Tahap A
// ------------------------------------------------------------
// Semua error dari route diteruskan ke middleware ini.
// Tujuannya: response error seragam dan tidak membocorkan
// detail database/stack trace ke frontend.
// ============================================================

import { ApiError } from '../utils/apiError.js';

// Middleware untuk route yang tidak ditemukan (404).
export function routeTidakDitemukan(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
}

// ============================================================
// MENERJEMAHKAN KODE ERROR MySQL
// Kode teknis ini dipetakan ke status HTTP + pesan yang ramah user.
// ============================================================
function terjemahkanErrorDatabase(error) {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return { status: 409, message: 'Data dengan ID/nama tersebut sudah digunakan.' };
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_NO_REFERENCED_ROW':
      return { status: 400, message: 'Data terkait tidak ditemukan (misalnya ID bahan belum ada).' };
    case 'ER_ROW_IS_REFERENCED_2':
    case 'ER_ROW_IS_REFERENCED':
      return { status: 409, message: 'Data tidak bisa dihapus karena masih dipakai data lain.' };
    case 'ER_TRUNCATED_WRONG_VALUE':
    case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD':
    case 'ER_DATA_TOO_LONG':
      return { status: 400, message: 'Format atau panjang data tidak sesuai.' };
    case 'ER_BAD_FIELD_ERROR':
      return { status: 500, message: 'Struktur query tidak sesuai dengan database.' };
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ECONNREFUSED':
    case 'ETIMEDOUT':
      return { status: 503, message: 'Koneksi database sedang tidak tersedia.' };
    default:
      return { status: 500, message: 'Terjadi kesalahan pada server.' };
  }
}

// Middleware error utama. Harus dipasang PALING TERAKHIR.
// Parameter keempat wajib ada agar Express mengenali ini sebagai error handler.
export function penangananError(error, req, res, _next) {
  // Log detail hanya di server untuk keperluan debugging.
  if (error instanceof ApiError) {
    console.warn(`[API] ${req.method} ${req.originalUrl} → ${error.status}: ${error.message}`);
    return res.status(error.status).json({ success: false, message: error.message });
  }

  console.error(`[API] ${req.method} ${req.originalUrl} →`, error.code || error.message);

  const info = terjemahkanErrorDatabase(error);

  // Detail internal tidak pernah dikirim ke client, apa pun nilai NODE_ENV.
  res.status(info.status).json({
    success: false,
    message: info.message,
  });
}
