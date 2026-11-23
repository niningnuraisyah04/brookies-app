// ============================================================
// CONTROLLER TRANSAKSI — Tahap C/D
// ------------------------------------------------------------
// Berisi logika database untuk pencatatan & penelusuran pesanan
// dari berbagai saluran penjualan Brookies.
// ============================================================

import db from '../config/database.js';
import { asyncHandler, notFound } from '../utils/apiError.js';

// Pilihan saluran mengikuti konteks usaha Brookies.
export const SALURAN = [
  'WhatsApp', 'Instagram', 'GrabFood', 'GoFood',
  'Penitipan Kafe', 'CFD', 'Langsung',
];

// Status pesanan yang dikenal aplikasi.
export const STATUS_TRANSAKSI = ['Diterima', 'Diproses', 'Selesai', 'Dibatalkan'];

// ============================================================
// MAPPING BARIS DATABASE → FORMAT FRONTEND
// DECIMAL dari mysql2 bertipe string, jadi dikonversi ke number.
// ============================================================
function mapTransaksi(row) {
  return {
    id: row.id_transaksi,
    tanggal: row.tanggal,
    saluran: row.saluran,
    produk: row.produk || '',
    jumlahProduk: Number(row.jumlah_produk),
    total: Number(row.total_pendapatan),
    status: row.status,
  };
}

// Query dasar dengan alias sesuai field frontend.
const SELECT_TRANSAKSI = `
  SELECT id_transaksi, tanggal, saluran, produk,
         jumlah_produk, total_pendapatan, status
  FROM transaksi
`;

// ------------------------------------------------------------
// GET /api/transaksi — daftar + filter opsional
// Filter: tanggal_mulai, tanggal_selesai, saluran, status
// ------------------------------------------------------------
export const daftarTransaksi = asyncHandler(async (req, res) => {
  const { tanggal_mulai, tanggal_selesai, saluran, status } = req.query;
  const klausa = [];
  const nilai = [];

  if (tanggal_mulai) { klausa.push('tanggal >= ?'); nilai.push(tanggal_mulai); }
  if (tanggal_selesai) { klausa.push('tanggal <= ?'); nilai.push(tanggal_selesai); }
  if (saluran) { klausa.push('saluran = ?'); nilai.push(saluran); }
  if (status) { klausa.push('status = ?'); nilai.push(status); }

  const where = klausa.length ? `WHERE ${klausa.join(' AND ')}` : '';
  const [rows] = await db.query(
    `${SELECT_TRANSAKSI} ${where} ORDER BY tanggal DESC, id_transaksi DESC`,
    nilai
  );

  res.json({ success: true, data: rows.map(mapTransaksi) });
});

// ------------------------------------------------------------
// GET /api/transaksi/:id — detail satu transaksi
// ------------------------------------------------------------
export const detailTransaksi = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `${SELECT_TRANSAKSI} WHERE id_transaksi = ?`,
    [req.params.id]
  );

  if (!rows.length) throw notFound('Transaksi tidak ditemukan.');
  res.json({ success: true, data: mapTransaksi(rows[0]) });
});

// ------------------------------------------------------------
// POST /api/transaksi — catat pesanan baru
// ------------------------------------------------------------
export const tambahTransaksi = asyncHandler(async (req, res) => {
  const t = req.dataValid;

  await db.query(
    `INSERT INTO transaksi
     (id_transaksi, tanggal, saluran, produk, jumlah_produk, total_pendapatan, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [t.id, t.tanggal, t.saluran, t.produk, t.jumlahProduk, t.total, t.status]
  );

  res.status(201).json({
    success: true,
    message: 'Transaksi berhasil dicatat.',
    data: { id: t.id },
  });
});

// ------------------------------------------------------------
// PUT /api/transaksi/:id — ubah pesanan
// ------------------------------------------------------------
export const ubahTransaksi = asyncHandler(async (req, res) => {
  const t = req.dataValid;
  const id = req.params.id;

  const [result] = await db.query(
    `UPDATE transaksi
     SET tanggal = ?, saluran = ?, produk = ?, jumlah_produk = ?,
         total_pendapatan = ?, status = ?
     WHERE id_transaksi = ?`,
    [t.tanggal, t.saluran, t.produk, t.jumlahProduk, t.total, t.status, id]
  );

  if (result.affectedRows === 0) throw notFound('Transaksi tidak ditemukan.');

  res.json({ success: true, message: 'Transaksi berhasil diperbarui.', data: { id } });
});

// ------------------------------------------------------------
// DELETE /api/transaksi/:id — hapus pesanan
// ------------------------------------------------------------
export const hapusTransaksi = asyncHandler(async (req, res) => {
  const [result] = await db.query(
    'DELETE FROM transaksi WHERE id_transaksi = ?',
    [req.params.id]
  );

  if (result.affectedRows === 0) throw notFound('Transaksi tidak ditemukan.');

  res.json({ success: true, message: 'Transaksi berhasil dihapus.' });
});
