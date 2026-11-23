// ============================================================
// SEED ADMIN — Tahap A
// ------------------------------------------------------------
// Membuat akun admin awal di MySQL jika belum ada.
// Password di-hash dengan bcrypt dan berasal dari .env.
// Cara pakai: node server/seedAdmin.js
// ============================================================

import bcrypt from 'bcrypt';
import db, { tutupKoneksiDatabase } from './config/database.js';
import { config, validasiConfigAdmin } from './config/env.js';

async function buatAdmin() {
  try {
    // Pastikan ADMIN_USERNAME/ADMIN_PASSWORD tersedia sebelum query.
    validasiConfigAdmin();

    const username = config.admin.username;
    const password = config.admin.password;
    const nama = config.admin.nama;

    // Cek apakah username sudah ada agar script aman dijalankan ulang.
    const [rows] = await db.query(
      'SELECT id_admin FROM admin WHERE username = ?',
      [username]
    );

    if (rows.length > 0) {
      console.log('Akun Admin sudah tersedia.');
      return;
    }

    // bcrypt: password plaintext tidak pernah disimpan ke database.
    const hash = await bcrypt.hash(password, 12);

    await db.query(
      'INSERT INTO admin (username, password, nama_admin) VALUES (?, ?, ?)',
      [username, hash, nama]
    );

    console.log('Akun Admin berhasil dibuat.');
  } catch (error) {
    // Hanya pesan umum yang ditampilkan; jangan cetak password/secret.
    console.error('[SEED] Gagal membuat admin:', error.message);
    process.exitCode = 1;
  } finally {
    await tutupKoneksiDatabase();
  }
}

buatAdmin();
