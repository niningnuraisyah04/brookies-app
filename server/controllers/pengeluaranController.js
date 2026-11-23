// ============================================================
// CONTROLLER PENGELUARAN — Tahap C/D
// ------------------------------------------------------------
// Pencatatan arus kas keluar terpusat di MySQL.
// Untuk pengeluaran 'Bahan Baku', stok bahan ikut disesuaikan
// dalam SATU transaksi database (atomic) agar tidak ada
// kondisi stok berubah tapi catatan gagal, atau sebaliknya.
// ============================================================

import db from '../config/database.js';
import { asyncHandler, badRequest, notFound } from '../utils/apiError.js';

// Kategori pengeluaran yang dikenal aplikasi.
export const KATEGORI_PENGELUARAN = ['Bahan Baku', 'Operasional'];

// Mapping baris DB ke format frontend (DECIMAL → number).
function mapPengeluaran(row) {
  return {
    id: row.id_pengeluaran,
    tanggal: row.tanggal,
    kategori: row.kategori,
    nama: row.nama_pengeluaran,
    total: Number(row.total),
    idBahan: row.id_bahan || '',
    jumlahBeli: row.jumlah_beli === null ? 0 : Number(row.jumlah_beli),
    satuan: row.satuan || '',
    hargaSatuan: row.harga_satuan === null ? 0 : Number(row.harga_satuan),
  };
}

const SELECT_PENGELUARAN = `
  SELECT id_pengeluaran, tanggal, kategori, nama_pengeluaran, total,
         id_bahan, jumlah_beli, satuan, harga_satuan
  FROM pengeluaran
`;

// ============================================================
// MENYESUAIKAN STOK BAHAN (dipanggil di dalam transaksi)
// delta > 0 → stok bertambah (pembelian)
// delta < 0 → stok berkurang (pembatalan/perubahan)
// ============================================================
async function sesuaikanStok(koneksi, idBahan, delta) {
  if (!idBahan || !delta) return;

  // FOR UPDATE mengunci baris agar dua request bersamaan tidak bertabrakan.
  const [bahan] = await koneksi.query(
    'SELECT stok, nama_bahan FROM bahan_baku WHERE id_bahan = ? FOR UPDATE',
    [idBahan]
  );

  if (!bahan.length) {
    throw notFound(`Bahan baku ${idBahan} tidak ditemukan.`);
  }

  const stokBaru = Number(bahan[0].stok) + delta;
  if (stokBaru < 0) {
    throw badRequest(`Stok ${bahan[0].nama_bahan} tidak mencukupi untuk pembatalan/perubahan ini.`);
  }

  await koneksi.query(
    'UPDATE bahan_baku SET stok = ? WHERE id_bahan = ?',
    [stokBaru, idBahan]
  );
}

// ============================================================
// GET /api/pengeluaran — daftar + filter tanggal
// ============================================================
export const daftarPengeluaran = asyncHandler(async (req, res) => {
  const { tanggal_mulai, tanggal_selesai, kategori } = req.query;
  const klausa = [];
  const nilai = [];

  if (tanggal_mulai) { klausa.push('tanggal >= ?'); nilai.push(tanggal_mulai); }
  if (tanggal_selesai) { klausa.push('tanggal <= ?'); nilai.push(tanggal_selesai); }
  if (kategori) { klausa.push('kategori = ?'); nilai.push(kategori); }

  const where = klausa.length ? `WHERE ${klausa.join(' AND ')}` : '';
  const [rows] = await db.query(
    `${SELECT_PENGELUARAN} ${where} ORDER BY tanggal DESC, id_pengeluaran DESC`,
    nilai
  );

  res.json({ success: true, data: rows.map(mapPengeluaran) });
});

// ============================================================
// GET /api/pengeluaran/:id
// ============================================================
export const detailPengeluaran = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `${SELECT_PENGELUARAN} WHERE id_pengeluaran = ?`,
    [req.params.id]
  );

  if (!rows.length) throw notFound('Pengeluaran tidak ditemukan.');
  res.json({ success: true, data: mapPengeluaran(rows[0]) });
});

// ============================================================
// POST /api/pengeluaran — catat pengeluaran baru
// ============================================================
export const tambahPengeluaran = asyncHandler(async (req, res) => {
  const p = req.dataValid;
  const koneksi = await db.getConnection();

  try {
    await koneksi.beginTransaction();

    // Pembelian bahan langsung menambah stok di MySQL.
    if (p.kategori === 'Bahan Baku') {
      await sesuaikanStok(koneksi, p.idBahan, p.jumlahBeli);
    }

    await koneksi.query(
      `INSERT INTO pengeluaran
       (id_pengeluaran, tanggal, kategori, nama_pengeluaran, total,
        id_bahan, jumlah_beli, satuan, harga_satuan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.tanggal, p.kategori, p.nama, p.total,
       p.idBahan, p.jumlahBeli, p.satuan, p.hargaSatuan]
    );

    await koneksi.commit();
  } catch (error) {
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();
  }

  res.status(201).json({
    success: true,
    message: 'Pengeluaran berhasil dicatat.',
    data: { id: p.id },
  });
});

// ============================================================
// PUT /api/pengeluaran/:id — ubah pengeluaran
// Stok lama dikembalikan, lalu stok baru diterapkan (delta).
// ============================================================
export const ubahPengeluaran = asyncHandler(async (req, res) => {
  const p = req.dataValid;
  const id = req.params.id;
  const koneksi = await db.getConnection();

  try {
    await koneksi.beginTransaction();

    const [lama] = await koneksi.query(
      `SELECT kategori, id_bahan, jumlah_beli
       FROM pengeluaran WHERE id_pengeluaran = ? FOR UPDATE`,
      [id]
    );

    if (!lama.length) throw notFound('Pengeluaran tidak ditemukan.');

    const efekLama = lama[0].kategori === 'Bahan Baku'
      ? Number(lama[0].jumlah_beli || 0)
      : 0;
    const efekBaru = p.kategori === 'Bahan Baku' ? p.jumlahBeli : 0;

    // Kembalikan stok lama ke bahan lama, lalu terapkan stok baru ke bahan baru.
    // Cara ini tetap benar jika bahan atau kategori diubah sekaligus.
    if (efekLama) await sesuaikanStok(koneksi, lama[0].id_bahan, -efekLama);
    if (efekBaru) await sesuaikanStok(koneksi, p.idBahan, efekBaru);

    const [result] = await koneksi.query(
      `UPDATE pengeluaran
       SET tanggal = ?, kategori = ?, nama_pengeluaran = ?, total = ?,
           id_bahan = ?, jumlah_beli = ?, satuan = ?, harga_satuan = ?
       WHERE id_pengeluaran = ?`,
      [p.tanggal, p.kategori, p.nama, p.total,
       p.idBahan, p.jumlahBeli, p.satuan, p.hargaSatuan, id]
    );

    if (result.affectedRows === 0) throw notFound('Pengeluaran tidak ditemukan.');

    await koneksi.commit();
  } catch (error) {
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();
  }

  res.json({ success: true, message: 'Pengeluaran berhasil diperbarui.', data: { id } });
});

// ============================================================
// DELETE /api/pengeluaran/:id — hapus + kembalikan stok
// ============================================================
export const hapusPengeluaran = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const koneksi = await db.getConnection();

  try {
    await koneksi.beginTransaction();

    const [lama] = await koneksi.query(
      `SELECT kategori, id_bahan, jumlah_beli
       FROM pengeluaran WHERE id_pengeluaran = ? FOR UPDATE`,
      [id]
    );

    if (!lama.length) throw notFound('Pengeluaran tidak ditemukan.');

    if (lama[0].kategori === 'Bahan Baku') {
      await sesuaikanStok(koneksi, lama[0].id_bahan, -Number(lama[0].jumlah_beli || 0));
    }

    const [result] = await koneksi.query(
      'DELETE FROM pengeluaran WHERE id_pengeluaran = ?',
      [id]
    );

    if (result.affectedRows === 0) throw notFound('Pengeluaran tidak ditemukan.');

    await koneksi.commit();
  } catch (error) {
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();
  }

  res.json({ success: true, message: 'Pengeluaran berhasil dihapus.' });
});
