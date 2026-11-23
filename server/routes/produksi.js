// ============================================================
// ROUTE PRODUKSI — Tahap D
// ------------------------------------------------------------
// Endpoint aktivitas produksi. Semua endpoint dilindungi JWT.
// Stok bahan diubah otomatis oleh controller dalam transaksi DB.
// ============================================================

import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { validasiBody, teks, angka, tanggal } from '../middleware/validate.js';
import {
  daftarProduksi, detailProduksi, tambahProduksi,
  ubahProduksi, hapusProduksi,
} from '../controllers/produksiController.js';

const router = express.Router();

router.use(authMiddleware);

// Jumlah hasil tidak dikirim frontend; dihitung server dari resep.
const schemaProduksi = {
  id: teks('ID produksi', { min: 1, max: 20 }),
  tanggal: tanggal('Tanggal'),
  produk: teks('Produk', { min: 1, max: 100 }),
  jumlahBatch: angka('Jumlah batch', { min: 1, bulat: true }),
};

router.get('/', daftarProduksi);
router.get('/:id', detailProduksi);
router.post('/', validasiBody(schemaProduksi), tambahProduksi);
router.put('/:id', validasiBody(schemaProduksi), ubahProduksi);
router.delete('/:id', hapusProduksi);

export default router;
