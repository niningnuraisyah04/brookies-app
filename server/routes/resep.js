// ============================================================
// ROUTE RESEP — Tahap B
// ------------------------------------------------------------
// Semua endpoint memerlukan JWT. Satu baris = satu bahan untuk
// suatu produk, sesuai struktur tabel `resep` yang sudah ada.
// ============================================================

import express from 'express';
import db from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import { validasiBody, teks, angka } from '../middleware/validate.js';
import { asyncHandler, notFound } from '../utils/apiError.js';

const router = express.Router();

// Lindungi seluruh route resep.
router.use(authMiddleware);

// Schema validasi resep.
const schemaResep = {
  produk: teks('Produk', { min: 1, max: 100 }),
  id_bahan: teks('ID bahan', { min: 1, max: 10 }),
  jumlah: angka('Jumlah bahan', { min: 0 }),
  satuan: teks('Satuan', { min: 1, max: 30 }),
  hasil_per_batch: angka('Hasil per batch', { min: 1, bulat: true }),
};

// ------------------------------------------------------------
// GET /api/resep — daftar resep
// ------------------------------------------------------------
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM resep ORDER BY id_resep ASC');
  res.json({ success: true, data: rows });
}));

// ------------------------------------------------------------
// POST /api/resep — tambah baris resep
// ------------------------------------------------------------
router.post('/', validasiBody(schemaResep), asyncHandler(async (req, res) => {
  const r = req.dataValid;

  const [result] = await db.query(
    `INSERT INTO resep (produk, id_bahan, jumlah, satuan, hasil_per_batch)
     VALUES (?, ?, ?, ?, ?)`,
    [r.produk, r.id_bahan, r.jumlah, r.satuan, r.hasil_per_batch]
  );

  res.status(201).json({
    success: true,
    message: 'Resep berhasil ditambahkan.',
    data: { id_resep: result.insertId },
  });
}));

// ------------------------------------------------------------
// PUT /api/resep/:id — update baris resep
// ------------------------------------------------------------
router.put('/:id', validasiBody(schemaResep), asyncHandler(async (req, res) => {
  const r = req.dataValid;

  const [result] = await db.query(
    `UPDATE resep
     SET produk = ?, id_bahan = ?, jumlah = ?, satuan = ?, hasil_per_batch = ?
     WHERE id_resep = ?`,
    [r.produk, r.id_bahan, r.jumlah, r.satuan, r.hasil_per_batch, req.params.id]
  );

  if (result.affectedRows === 0) throw notFound('Resep tidak ditemukan.');

  res.json({ success: true, message: 'Resep berhasil diperbarui.' });
}));

// ------------------------------------------------------------
// DELETE /api/resep/:id — hapus baris resep
// ------------------------------------------------------------
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    'DELETE FROM resep WHERE id_resep = ?',
    [req.params.id]
  );

  if (result.affectedRows === 0) throw notFound('Resep tidak ditemukan.');

  res.json({ success: true, message: 'Resep berhasil dihapus.' });
}));

export default router;
