// ============================================================
// MIGRASI 001 — Tambah kolom `produk` pada tabel transaksi
// ------------------------------------------------------------
// Disetujui pengguna: kolom baru bersifat NULLABLE.
// TIDAK menghapus tabel, TIDAK mengganti nama kolom, TIDAK mereset data.
// Aman dijalankan berulang (idempotent): kolom dicek dulu.
// Cara pakai: npm run migrate
// ============================================================

import db, { tutupKoneksiDatabase } from '../config/database.js';
import { config } from '../config/env.js';

async function jalankanMigrasi() {
  try {
    const [kolom] = await db.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'transaksi' AND COLUMN_NAME = 'produk'`,
      [config.database.name]
    );

    if (kolom.length > 0) {
      console.log('[MIGRASI] Kolom transaksi.produk sudah ada, tidak ada perubahan.');
      return;
    }

    await db.query(
      'ALTER TABLE transaksi ADD COLUMN produk varchar(100) NULL AFTER saluran'
    );

    console.log('[MIGRASI] Kolom transaksi.produk berhasil ditambahkan (nullable).');
  } catch (error) {
    console.error('[MIGRASI] Gagal:', error.code || error.message);
    process.exitCode = 1;
  } finally {
    await tutupKoneksiDatabase();
  }
}

jalankanMigrasi();
