// ============================================================
// CONTROLLER DASHBOARD & LAPORAN — Tahap D
// ------------------------------------------------------------
// Menyajikan ringkasan penjualan per periode dan data laporan
// keuntungan yang langsung berasal dari MySQL.
// Frontend tetap membangun Tree Tahun → Bulan → Hari dengan
// struktur data yang sudah ada di src/structures/tree.js.
// ============================================================

import db from '../config/database.js';
import { asyncHandler, badRequest } from '../utils/apiError.js';

// Nama bulan singkat dalam bahasa Indonesia.
const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const tahunSekarang = () => new Date().getFullYear();

// Validasi sederhana untuk format tanggal YYYY-MM-DD.
function tanggalValid(nilai) {
  return /^\d{4}-\d{2}-\d{2}$/.test(nilai || '') && !Number.isNaN(Date.parse(`${nilai}T00:00:00Z`));
}

// ============================================================
// GET /api/laporan/dashboard?tahun=2026
// Ringkasan untuk kartu, grafik bulanan, saluran, dan stok.
// ============================================================
export const ringkasanDashboard = asyncHandler(async (req, res) => {
  const tahun = req.query.tahun ? Number(req.query.tahun) : tahunSekarang();
  if (!Number.isInteger(tahun) || tahun < 2000 || tahun > 2100) {
    throw badRequest('Parameter tahun tidak valid.');
  }

  // Pendapatan hanya dihitung dari transaksi berstatus Selesai.
  const [[dataPendapatan]] = await db.query(
    `SELECT COALESCE(SUM(total_pendapatan), 0) AS nilai, COUNT(*) AS jumlah
     FROM transaksi
     WHERE status = 'Selesai' AND YEAR(tanggal) = ?`,
    [tahun]
  );

  const [[dataPengeluaran]] = await db.query(
    `SELECT COALESCE(SUM(total), 0) AS nilai, COUNT(*) AS jumlah
     FROM pengeluaran WHERE YEAR(tanggal) = ?`,
    [tahun]
  );

  const [[dataProduksi]] = await db.query(
    `SELECT COALESCE(SUM(jumlah_hasil), 0) AS hasil, COUNT(*) AS jumlah
     FROM produksi WHERE YEAR(tanggal) = ?`,
    [tahun]
  );

  // Distribusi pesanan per saluran penjualan.
  const [perSaluran] = await db.query(
    `SELECT saluran AS nama,
            COUNT(*) AS jumlah,
            COALESCE(SUM(total_pendapatan), 0) AS pendapatan
     FROM transaksi
     WHERE YEAR(tanggal) = ?
     GROUP BY saluran
     ORDER BY jumlah DESC`,
    [tahun]
  );

  // Grafik bulanan: query yang ada, lalu dilengkapi bulan kosong di JS.
  const [pendapatanBulanan] = await db.query(
    `SELECT MONTH(tanggal) AS bulan, COALESCE(SUM(total_pendapatan), 0) AS nilai
     FROM transaksi
     WHERE status = 'Selesai' AND YEAR(tanggal) = ?
     GROUP BY MONTH(tanggal)`,
    [tahun]
  );

  const [pengeluaranBulanan] = await db.query(
    `SELECT MONTH(tanggal) AS bulan, COALESCE(SUM(total), 0) AS nilai
     FROM pengeluaran
     WHERE YEAR(tanggal) = ?
     GROUP BY MONTH(tanggal)`,
    [tahun]
  );

  const petaPendapatan = new Map(pendapatanBulanan.map((r) => [Number(r.bulan), Number(r.nilai)]));
  const petaPengeluaran = new Map(pengeluaranBulanan.map((r) => [Number(r.bulan), Number(r.nilai)]));

  const perBulan = NAMA_BULAN.map((nama, index) => {
    const bulan = index + 1;
    return {
      bulan,
      nama,
      pendapatan: petaPendapatan.get(bulan) || 0,
      pengeluaran: petaPengeluaran.get(bulan) || 0,
    };
  });

  // Bahan yang stoknya sudah di atau di bawah batas minimum.
  const [stokMenipis] = await db.query(
    `SELECT id_bahan AS id, nama_bahan AS nama, stok, satuan,
            batas_minimum AS minimum
     FROM bahan_baku
     WHERE stok <= batas_minimum
     ORDER BY (stok - batas_minimum) ASC
     LIMIT 10`
  );

  // Transaksi terbaru untuk daftar aktivitas.
  const [transaksiTerbaru] = await db.query(
    `SELECT id_transaksi AS id, tanggal, saluran, produk, status,
            total_pendapatan AS total
     FROM transaksi
     WHERE YEAR(tanggal) = ?
     ORDER BY tanggal DESC, id_transaksi DESC
     LIMIT 5`,
    [tahun]
  );

  const pendapatan = Number(dataPendapatan.nilai);
  const pengeluaran = Number(dataPengeluaran.nilai);

  res.json({
    success: true,
    data: {
      tahun,
      ringkasan: {
        pendapatan,
        pengeluaran,
        keuntungan: pendapatan - pengeluaran,
        jumlahTransaksi: Number(dataPendapatan.jumlah),
        jumlahPengeluaran: Number(dataPengeluaran.jumlah),
        jumlahProduksi: Number(dataProduksi.jumlah),
        jumlahHasilProduksi: Number(dataProduksi.hasil),
      },
      perBulan,
      perSaluran: perSaluran.map((r) => ({
        nama: r.nama,
        jumlah: Number(r.jumlah),
        pendapatan: Number(r.pendapatan),
      })),
      stokMenipis: stokMenipis.map((r) => ({
        ...r,
        stok: Number(r.stok),
        minimum: Number(r.minimum),
      })),
      transaksiTerbaru: transaksiTerbaru.map((r) => ({
        ...r,
        total: Number(r.total),
      })),
    },
  });
});

// ============================================================
// GET /api/laporan/keuntungan?tahun=2026
// atau /api/laporan/keuntungan?tanggal_mulai=2026-01-01&tanggal_selesai=2026-03-31
// Mengembalikan baris transaksi & pengeluaran untuk dibangun
// menjadi laporan hierarkis di frontend.
// ============================================================
export const laporanKeuntungan = asyncHandler(async (req, res) => {
  let { tanggal_mulai, tanggal_selesai, tahun } = req.query;

  // Jika rentang tanggal tidak diberikan, default satu tahun berjalan.
  if (!tanggal_mulai && !tanggal_selesai) {
    const t = tahun ? Number(tahun) : tahunSekarang();
    if (!Number.isInteger(t) || t < 2000 || t > 2100) {
      throw badRequest('Parameter tahun tidak valid.');
    }
    tanggal_mulai = `${t}-01-01`;
    tanggal_selesai = `${t}-12-31`;
  }

  // Tanggal boleh salah satu saja; sisi yang kosong diisi batas tahun.
  if (!tanggal_mulai) tanggal_mulai = `${tahunSekarang()}-01-01`;
  if (!tanggal_selesai) tanggal_selesai = `${tahunSekarang()}-12-31`;

  if (!tanggalValid(tanggal_mulai) || !tanggalValid(tanggal_selesai)) {
    throw badRequest('Format tanggal harus YYYY-MM-DD.');
  }

  if (tanggal_mulai > tanggal_selesai) {
    throw badRequest('Tanggal mulai tidak boleh setelah tanggal selesai.');
  }

  const [rowsTransaksi] = await db.query(
    `SELECT id_transaksi, tanggal, saluran, produk, jumlah_produk,
            total_pendapatan, status
     FROM transaksi
     WHERE tanggal BETWEEN ? AND ?
     ORDER BY tanggal ASC, id_transaksi ASC`,
    [tanggal_mulai, tanggal_selesai]
  );

  const [rowsPengeluaran] = await db.query(
    `SELECT id_pengeluaran, tanggal, kategori, nama_pengeluaran, total,
            id_bahan, jumlah_beli, satuan, harga_satuan
     FROM pengeluaran
     WHERE tanggal BETWEEN ? AND ?
     ORDER BY tanggal ASC, id_pengeluaran ASC`,
    [tanggal_mulai, tanggal_selesai]
  );

  const transaksi = rowsTransaksi.map((r) => ({
    id: r.id_transaksi,
    tanggal: r.tanggal,
    saluran: r.saluran,
    produk: r.produk || '',
    jumlahProduk: Number(r.jumlah_produk),
    total: Number(r.total_pendapatan),
    status: r.status,
  }));

  const pengeluaran = rowsPengeluaran.map((r) => ({
    id: r.id_pengeluaran,
    tanggal: r.tanggal,
    kategori: r.kategori,
    nama: r.nama_pengeluaran,
    total: Number(r.total),
    idBahan: r.id_bahan || '',
    jumlahBeli: r.jumlah_beli === null ? 0 : Number(r.jumlah_beli),
    satuan: r.satuan || '',
    hargaSatuan: r.harga_satuan === null ? 0 : Number(r.harga_satuan),
  }));

  const pendapatan = transaksi
    .filter((t) => t.status === 'Selesai')
    .reduce((jumlah, t) => jumlah + t.total, 0);
  const totalPengeluaran = pengeluaran.reduce((jumlah, p) => jumlah + p.total, 0);

  res.json({
    success: true,
    data: {
      periode: { mulai: tanggal_mulai, selesai: tanggal_selesai },
      ringkasan: {
        pendapatan,
        pengeluaran: totalPengeluaran,
        keuntungan: pendapatan - totalPengeluaran,
      },
      // Format ini sesuai ekspektasi bangunTreeLaporan() di frontend.
      transaksi,
      pengeluaran,
    },
  });
});
