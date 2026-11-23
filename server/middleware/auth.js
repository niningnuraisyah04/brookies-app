// ============================================================
// MIDDLEWARE AUTENTIKASI JWT — Tahap B
// ------------------------------------------------------------
// Dipasang pada semua endpoint administrasi.
// Cara pakai frontend:
//   Authorization: Bearer <token>
// Token diverifikasi dengan JWT_SECRET dari .env (bukan hard-code).
// ============================================================

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { unauthorized } from '../utils/apiError.js';

// Satu pesan 401 yang sama dengan frontend (src/constants/app.js).
const PESAN_SESI_BERAKHIR = 'Sesi login berakhir. Silakan login kembali.';

export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [skema, token] = header.split(' ');

  // Format header harus: Bearer <token>
  if (skema !== 'Bearer' || !token) {
    return next(unauthorized(PESAN_SESI_BERAKHIR));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);

    // Pastikan payload berisi identitas admin yang dikenal.
    if (!payload.id) {
      return next(unauthorized(PESAN_SESI_BERAKHIR));
    }

    // Simpan data admin di request agar controller bisa menggunakannya.
    req.admin = payload;
    next();
  } catch {
    // Detail error JWT sengaja tidak diteruskan ke client.
    next(unauthorized(PESAN_SESI_BERAKHIR));
  }
}
