// ============================================================
// ROUTE TRANSAKSI — Tahap D
// ------------------------------------------------------------
// Semua endpoint dilindungi JWT karena berisi data penjualan.
// Validasi dilakukan sebelum controller dipanggil.
// ============================================================

import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { validasiBody, teks, angka, tanggal, pilihan } from '../middleware/validate.js';
import {
  daftarTransaksi, detailTransaksi, tambahTransaksi,
  ubahTransaksi, hapusTransaksi, SALURAN, STATUS_TRANSAKSI,
} from '../controllers/transaksiController.js';

const router = express.Router();

router.use(authMiddleware);

// Schema transaksi. Total dihitung frontend dari menu, tetapi tetap
// divalidasi agar tidak negatif.
const schemaTransaksi = {
  id: teks('ID transaksi', { min: 1, max: 20 }),
  tanggal: tanggal('Tanggal'),
  saluran: pilihan('Saluran', SALURAN),
  produk: teks('Produk', { min: 1, max: 100 }),
  jumlahProduk: angka('Jumlah produk', { min: 1, bulat: true }),
  total: angka('Total pendapatan', { min: 0 }),
  status: pilihan('Status', STATUS_TRANSAKSI),
};

// PUT memakai id dari URL, jadi field id tidak wajib di body.
const schemaUbah = { ...schemaTransaksi };
delete schemaUbah.id;

router.get('/', daftarTransaksi);
router.get('/:id', detailTransaksi);
router.post('/', validasiBody(schemaTransaksi), tambahTransaksi);
router.put('/:id', validasiBody(schemaUbah), ubahTransaksi);
router.delete('/:id', hapusTransaksi);

export default router;
