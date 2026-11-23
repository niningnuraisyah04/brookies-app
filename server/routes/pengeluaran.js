// ============================================================
// ROUTE PENGELUARAN — Tahap D
// ------------------------------------------------------------
// Endpoint pencatatan pengeluaran usaha (bahan baku + operasional).
// Semua endpoint dilindungi JWT.
// ============================================================

import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { validasiBody, teks, angka, tanggal, pilihan, opsional } from '../middleware/validate.js';
import { badRequest } from '../utils/apiError.js';
import {
  daftarPengeluaran, detailPengeluaran, tambahPengeluaran,
  ubahPengeluaran, hapusPengeluaran, KATEGORI_PENGELUARAN,
} from '../controllers/pengeluaranController.js';

const router = express.Router();

router.use(authMiddleware);

// Validasi umum. Field bahan baru diproses lebih lanjut di bawah.
const schemaDasar = {
  id: teks('ID pengeluaran', { min: 1, max: 20 }),
  tanggal: tanggal('Tanggal'),
  kategori: pilihan('Kategori', KATEGORI_PENGELUARAN),
  nama: teks('Nama pengeluaran', { min: 1, max: 100 }),
  total: opsional(angka('Total', { min: 0 }), 0),
  idBahan: opsional(teks('ID bahan', { min: 1, max: 10 }), null),
  jumlahBeli: opsional(angka('Jumlah beli', { min: 0 }), null),
  satuan: opsional(teks('Satuan', { min: 1, max: 30 }), null),
  hargaSatuan: opsional(angka('Harga satuan', { min: 0 }), 0),
};

// Validasi lanjutan tergantung kategori.
function validasiPengeluaran(req, res, next) {
  validasiBody(schemaDasar)(req, res, () => {
    const p = req.dataValid;

    if (p.kategori === 'Bahan Baku') {
      if (!p.idBahan) return next(badRequest('Bahan baku wajib dipilih.'));
      if (!(p.jumlahBeli > 0)) return next(badRequest('Jumlah beli harus lebih dari 0.'));
      if (!(p.hargaSatuan > 0)) return next(badRequest('Harga satuan harus lebih dari 0.'));
      if (!p.satuan) return next(badRequest('Satuan wajib diisi.'));

      // Total pembelian dihitung server, bukan dipercaya dari frontend.
      p.total = Math.round(p.jumlahBeli * p.hargaSatuan * 100) / 100;
    } else {
      if (!(p.total > 0)) return next(badRequest('Total pengeluaran operasional harus lebih dari 0.'));

      // Kolom terkait bahan dikosongkan agar data tetap rapi.
      p.idBahan = null;
      p.jumlahBeli = null;
      p.satuan = null;
      p.hargaSatuan = null;
    }

    next();
  });
}

// Frontend mengirim objek lengkap (termasuk id) untuk PUT,
// sehingga satu validator yang sama bisa dipakai POST dan PUT.
router.get('/', daftarPengeluaran);
router.get('/:id', detailPengeluaran);
router.post('/', validasiPengeluaran, tambahPengeluaran);
router.put('/:id', validasiPengeluaran, ubahPengeluaran);
router.delete('/:id', hapusPengeluaran);

export default router;
