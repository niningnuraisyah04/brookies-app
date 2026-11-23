// ============================================================
// ROUTE AUTENTIKASI ADMIN — Tahap B
// ------------------------------------------------------------
// POST /api/auth/login → public, mengembalikan JWT
// GET  /api/auth/me    → protected, mengembalikan data admin
// Password/hash TIDAK pernah dikirim ke frontend.
// ============================================================

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { config } from '../config/env.js';
import authMiddleware from '../middleware/auth.js';
import { validasiBody, teks } from '../middleware/validate.js';
import { asyncHandler, unauthorized, notFound } from '../utils/apiError.js';

const router = express.Router();

// Validasi body login sebelum query database.
const validasiLogin = validasiBody({
  username: teks('Username', { min: 1, max: 50 }),
  password: teks('Password', { min: 1, max: 200 }),
});

// ------------------------------------------------------------
// LOGIN ADMIN
// ------------------------------------------------------------
router.post('/login', validasiLogin, asyncHandler(async (req, res) => {
  const { username, password } = req.dataValid;

  // Ambil password hash hanya untuk perbandingan bcrypt di server.
  const [rows] = await db.query(
    `SELECT id_admin, username, password, nama_admin
     FROM admin WHERE username = ?`,
    [username]
  );

  // Pesan yang sama untuk username salah maupun password salah
  // agar tidak membocorkan akun yang terdaftar.
  if (rows.length === 0) {
    throw unauthorized('Username atau password salah.');
  }

  const admin = rows[0];
  const cocok = await bcrypt.compare(password, admin.password);

  if (!cocok) {
    throw unauthorized('Username atau password salah.');
  }

  // JWT berisi identitas minimal; jangan memasukkan password/hash.
  const token = jwt.sign(
    { id: admin.id_admin, username: admin.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.json({
    success: true,
    message: 'Login berhasil.',
    token,
    // Hanya field aman yang dikirim ke frontend.
    admin: {
      id: admin.id_admin,
      username: admin.username,
      nama: admin.nama_admin,
    },
  });
}));

// ------------------------------------------------------------
// CEK SESI
// ------------------------------------------------------------
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT id_admin, username, nama_admin
     FROM admin WHERE id_admin = ?`,
    [req.admin.id]
  );

  if (rows.length === 0) {
    throw notFound('Admin tidak ditemukan.');
  }

  res.json({
    success: true,
    admin: {
      id: rows[0].id_admin,
      username: rows[0].username,
      nama: rows[0].nama_admin,
    },
  });
}));

export default router;
