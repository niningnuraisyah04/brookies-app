// ============================================================
// ROUTE BAHAN BAKU — Tahap B
// ------------------------------------------------------------
// Semua endpoint di sini memerlukan JWT (administrasi).
// Query disesuaikan dengan struktur tabel `bahan_baku` yang ada.
// ============================================================

import express from 'express';
import db from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import { validasiBody, teks, angka, opsional } from '../middleware/validate.js';
import { asyncHandler, notFound } from '../utils/apiError.js';

const router = express.Router();

// Lindungi seluruh route bahan baku.
router.use(authMiddleware);

// Schema validasi untuk tambah/update bahan.
const schemaBahan = {
  id: teks('ID bahan', { min: 1, max: 10 }),
  nama: teks('Nama bahan', { min: 1, max: 100 }),
  stok: opsional(angka('Stok', { min: 0, bulat: true }), 0),
  satuan: teks('Satuan', { min: 1, max: 30 }),
  minimum: opsional(angka('Batas minimum', { min: 0, bulat: true }), 0),
  kebutuhanBulanan: opsional(angka('Kebutuhan bulanan', { min: 0, bulat: true }), 0),
  hargaBahan: opsional(angka('Harga bahan', { min: 0 }), 0),
};

// ------------------------------------------------------------
// GET /api/bahan — daftar bahan baku
// ------------------------------------------------------------
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      id_bahan AS id,
      nama_bahan AS nama,
      stok,
      satuan,
      batas_minimum AS minimum,
      kebutuhan_bulanan AS kebutuhanBulanan,
      harga_bahan AS hargaBahan
    FROM bahan_baku
    ORDER BY id_bahan ASC
  `);

  res.json({ success: true, data: rows });
}));

// ------------------------------------------------------------
// POST /api/bahan — tambah bahan baku
// ------------------------------------------------------------
router.post('/', validasiBody(schemaBahan), asyncHandler(async (req, res) => {
  const b = req.dataValid;

  await db.query(
    `INSERT INTO bahan_baku
     (id_bahan, nama_bahan, stok, satuan, batas_minimum, kebutuhan_bulanan, harga_bahan)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [b.id, b.nama, b.stok, b.satuan, b.minimum, b.kebutuhanBulanan, b.hargaBahan]
  );

  res.status(201).json({
    success: true,
    message: 'Bahan baku berhasil ditambahkan.',
    data: { id: b.id },
  });
}));

// ------------------------------------------------------------
// PUT /api/bahan/:id — update bahan baku
// ------------------------------------------------------------
router.put('/:id', validasiBody(schemaBahan), asyncHandler(async (req, res) => {
  const b = req.dataValid;
  const id = req.params.id;

  const [result] = await db.query(
    `UPDATE bahan_baku
     SET nama_bahan = ?, stok = ?, satuan = ?, batas_minimum = ?,
         kebutuhan_bulanan = ?, harga_bahan = ?
     WHERE id_bahan = ?`,
    [b.nama, b.stok, b.satuan, b.minimum, b.kebutuhanBulanan, b.hargaBahan, id]
  );

  if (result.affectedRows === 0) throw notFound('Bahan baku tidak ditemukan.');

  res.json({ success: true, message: 'Bahan baku berhasil diperbarui.', data: { id } });
}));

// ------------------------------------------------------------
// DELETE /api/bahan/:id — hapus bahan baku
// ------------------------------------------------------------
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    'DELETE FROM bahan_baku WHERE id_bahan = ?',
    [req.params.id]
  );

  if (result.affectedRows === 0) throw notFound('Bahan baku tidak ditemukan.');

  res.json({ success: true, message: 'Bahan baku berhasil dihapus.' });
}));

export default router;
