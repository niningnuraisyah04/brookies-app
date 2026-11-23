// ============================================================
// MIGRASI 002 — Snapshot resep produksi (Tahap 2, Opsi E.2)
// ------------------------------------------------------------
// Menambahkan tabel `produksi_detail`, dua kolom pada `produksi`,
// dan index pada `resep.produk`.
//
// Opsi E.2: produksi lama TIDAK direkonstruksi. Catatan lama yang
// tidak punya detail ditandai 'rekonstruksi', stok dan jumlah_hasil
// tidak disentuh, dan `produksi_detail` tidak diisi.
//
// Aman dijalankan ulang: setiap objek dicek di INFORMATION_SCHEMA.
// Pengaman: migrasi menolak database utama brookies_db kecuali
// variabel IZINKAN_MIGRASI_UTAMA=1 diberikan secara eksplisit.
//
// Cara pakai (database uji):
//   DB_NAME=brookies_db_test node server/migrations/002_snapshot_resep_produksi.js
// ============================================================

import db, { tutupKoneksiDatabase } from '../config/database.js';
import { config } from '../config/env.js';

const NAMA_DB = config.database.name;

async function adaTabel(nama) {
  const [rows] = await db.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [NAMA_DB, nama]
  );
  return rows.length > 0;
}

async function adaKolom(tabel, kolom) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [NAMA_DB, tabel, kolom]
  );
  return rows.length > 0;
}

async function adaIndex(tabel, index) {
  const [rows] = await db.query(
    `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [NAMA_DB, tabel, index]
  );
  return rows.length > 0;
}

async function jalankanMigrasi() {
  if (NAMA_DB === 'brookies_db' && process.env.IZINKAN_MIGRASI_UTAMA !== '1') {
    throw new Error(
      '[MIGRASI] Ditolak: database utama brookies_db terdeteksi. ' +
      'Jalankan pada database uji (mis. DB_NAME=brookies_db_test) terlebih dahulu.'
    );
  }

  console.log('[MIGRASI] Database tujuan:', NAMA_DB);

  if (!(await adaKolom('produksi', 'hasil_per_batch_snapshot'))) {
    await db.query(
      'ALTER TABLE produksi ADD COLUMN hasil_per_batch_snapshot INT NULL AFTER jumlah_hasil'
    );
    console.log('[MIGRASI] produksi.hasil_per_batch_snapshot ditambahkan.');
  } else {
    console.log('[MIGRASI] produksi.hasil_per_batch_snapshot sudah ada.');
  }

  if (!(await adaKolom('produksi', 'sumber_snapshot'))) {
    await db.query(
      `ALTER TABLE produksi ADD COLUMN sumber_snapshot
       ENUM('terverifikasi','rekonstruksi') NOT NULL DEFAULT 'terverifikasi'
       AFTER hasil_per_batch_snapshot`
    );
    console.log('[MIGRASI] produksi.sumber_snapshot ditambahkan.');
  } else {
    console.log('[MIGRASI] produksi.sumber_snapshot sudah ada.');
  }

  if (!(await adaIndex('resep', 'idx_resep_produk'))) {
    await db.query('CREATE INDEX idx_resep_produk ON resep(produk)');
    console.log('[MIGRASI] Index resep.idx_resep_produk ditambahkan.');
  } else {
    console.log('[MIGRASI] Index resep.idx_resep_produk sudah ada.');
  }

  if (!(await adaTabel('produksi_detail'))) {
    // Samakan charset/collation dengan kolom yang dirujuk FK.
    const [ref] = await db.query(
      `SELECT CHARACTER_SET_NAME cs, COLLATION_NAME coll
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'produksi' AND COLUMN_NAME = 'id_produksi'`,
      [NAMA_DB]
    );
    const { cs, coll } = ref[0];
    await db.query(`
      CREATE TABLE produksi_detail (
        id_detail             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        id_produksi           VARCHAR(20)  NOT NULL,
        id_resep              INT          NULL,
        id_bahan              VARCHAR(10)  NULL,
        nama_bahan_snapshot   VARCHAR(100) NOT NULL,
        jumlah_per_batch      INT          NOT NULL,
        satuan_snapshot       VARCHAR(30)  NOT NULL,
        jumlah_batch_snapshot INT          NOT NULL,
        jumlah_pemakaian      INT          NOT NULL,
        urutan                INT          NOT NULL DEFAULT 0,
        PRIMARY KEY (id_detail),
        INDEX idx_produksi_detail_produksi (id_produksi),
        CONSTRAINT fk_pd_produksi
          FOREIGN KEY (id_produksi) REFERENCES produksi(id_produksi)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_pd_resep
          FOREIGN KEY (id_resep) REFERENCES resep(id_resep)
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_pd_bahan
          FOREIGN KEY (id_bahan) REFERENCES bahan_baku(id_bahan)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=${cs} COLLATE=${coll}
    `);
    console.log('[MIGRASI] Tabel produksi_detail dibuat.');
  } else {
    console.log('[MIGRASI] Tabel produksi_detail sudah ada.');
  }

  // E.2: tandai produksi lama yang tidak memiliki snapshot.
  // Tidak ada INSERT ke produksi_detail dan tidak ada UPDATE stok/jumlah_hasil.
  const [tanda] = await db.query(
    `UPDATE produksi p
     SET p.sumber_snapshot = 'rekonstruksi'
     WHERE p.sumber_snapshot = 'terverifikasi'
       AND NOT EXISTS (
         SELECT 1 FROM produksi_detail d WHERE d.id_produksi = p.id_produksi
       )`
  );
  console.log(`[MIGRASI] Produksi lama ditandai rekonstruksi: ${tanda.affectedRows} baris.`);

  const [cek] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM produksi) total,
       (SELECT COUNT(*) FROM produksi WHERE sumber_snapshot='rekonstruksi') rekonstruksi,
       (SELECT COUNT(*) FROM produksi_detail) detail`
  );
  console.log('[MIGRASI] Ringkasan:', JSON.stringify(cek[0]));
}

try {
  await jalankanMigrasi();
} catch (error) {
  console.error('[MIGRASI] Gagal:', error.message);
  process.exitCode = 1;
} finally {
  await tutupKoneksiDatabase();
}
