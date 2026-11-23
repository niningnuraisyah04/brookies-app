// ============================================================
// CONTROLLER PRODUKSI — Tahap C/D + SNAPSHOT RESEP (Tahap 2)
// ------------------------------------------------------------
// Setiap batch produksi:
//  1. mengunci resep & membaca komposisinya,
//  2. menyimpan salinan komposisi ke `produksi_detail` (snapshot),
//  3. mengecek & mengurangi stok di `bahan_baku`.
// Edit dan hapus memakai snapshot lama untuk mengembalikan stok,
// bukan resep yang sedang aktif.
// Semua langkah berada dalam SATU transaksi MySQL.
// ============================================================

import db from '../config/database.js';
import { asyncHandler, badRequest, notFound } from '../utils/apiError.js';

// Mapping baris DB ke format frontend.
function mapProduksi(row) {
  return {
    id: row.id_produksi,
    tanggal: row.tanggal,
    produk: row.produk,
    jumlahBatch: Number(row.jumlah_batch),
    jumlahHasil: Number(row.jumlah_hasil),
    sumberSnapshot: row.sumber_snapshot || 'terverifikasi',
  };
}

const SELECT_PRODUKSI = `
  SELECT id_produksi, tanggal, produk, jumlah_batch, jumlah_hasil, sumber_snapshot
  FROM produksi
`;

const SELECT_DETAIL = `
  SELECT id_detail, id_resep, id_bahan, nama_bahan_snapshot, jumlah_per_batch,
         satuan_snapshot, jumlah_batch_snapshot, jumlah_pemakaian, urutan
  FROM produksi_detail
`;

const PESAN_TANPA_SNAPSHOT =
  'Catatan produksi lama belum memiliki snapshot komposisi. ' +
  'Penyesuaian stok otomatis tidak tersedia dan memerlukan konfirmasi manual.';

// ============================================================
// AMBIL RESEP PRODUK (DIKUNCI)
// ============================================================
async function ambilResepProduk(koneksi, produk) {
  const [rows] = await koneksi.query(
    `SELECT r.id_resep, r.produk, r.id_bahan, r.jumlah, r.satuan, r.hasil_per_batch,
            b.nama_bahan
     FROM resep r
     LEFT JOIN bahan_baku b ON b.id_bahan = r.id_bahan
     WHERE r.produk = ?
     ORDER BY r.id_resep ASC
     FOR UPDATE`,
    [produk]
  );

  if (!rows.length) {
    throw badRequest(`Resep produk "${produk}" belum tersedia.`);
  }

  // Semua baris resep harus sepakat tentang hasil per batch.
  const daftarHasil = [...new Set(rows.map((r) => Number(r.hasil_per_batch)))];
  if (daftarHasil.length !== 1) {
    throw badRequest(
      `Hasil per batch resep produk "${produk}" tidak konsisten. Perbaiki resep terlebih dahulu.`
    );
  }

  return { rows, hasilPerBatch: daftarHasil[0] };
}

// Mengubah baris resep menjadi daftar pemakaian sekaligus data snapshot.
// Baris dengan id_bahan ganda tetap disimpan apa adanya pada snapshot;
// agregasi hanya terjadi saat penyesuaian stok.
function hitungPemakaian(resep, jumlahBatch) {
  return resep.map((r, indeks) => ({
    idResep: r.id_resep,
    idBahan: r.id_bahan,
    namaBahan: r.nama_bahan || 'Bahan tidak ditemukan',
    jumlahPerBatch: Number(r.jumlah),
    satuan: r.satuan,
    jumlahBatch,
    jumlah: Number(r.jumlah) * jumlahBatch,
    urutan: indeks + 1,
  }));
}

// Baris snapshot → format pemakaian untuk terapkanStok.
function pemakaianDariSnapshot(rows) {
  return rows.map((r) => ({
    idBahan: r.id_bahan,
    jumlah: Number(r.jumlah_pemakaian),
  }));
}

// ============================================================
// TERAPKAN PERUBAHAN STOK
// arah = -1 → kurangi stok saat produksi
// arah = +1 → kembalikan stok saat edit/hapus
// ============================================================
async function terapkanStok(koneksi, pemakaian, arah) {
  // Hash Map: gabungkan bahan yang muncul lebih dari sekali.
  const ringkas = new Map();
  for (const item of pemakaian) {
    // Bahan master yang dihapus membuat id_bahan NULL → dilewati.
    if (item.idBahan === null || item.idBahan === undefined || item.idBahan === '') continue;
    ringkas.set(item.idBahan, (ringkas.get(item.idBahan) || 0) + Number(item.jumlah || 0));
  }

  // Urutan penguncian konsisten untuk mengurangi risiko deadlock.
  const daftar = [...ringkas.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  for (const [idBahan, jumlah] of daftar) {
    const [bahan] = await koneksi.query(
      'SELECT stok, nama_bahan FROM bahan_baku WHERE id_bahan = ? FOR UPDATE',
      [idBahan]
    );

    if (!bahan.length) {
      throw notFound(`Bahan baku ${idBahan} tidak ditemukan.`);
    }

    const stokBaru = Number(bahan[0].stok) + arah * jumlah;
    if (arah < 0 && stokBaru < 0) {
      throw badRequest(`Stok ${bahan[0].nama_bahan} tidak mencukupi untuk produksi ini.`);
    }

    await koneksi.query(
      'UPDATE bahan_baku SET stok = ? WHERE id_bahan = ?',
      [stokBaru, idBahan]
    );
  }
}

// ============================================================
// SNAPSHOT
// ============================================================
async function simpanDetail(koneksi, idProduksi, pemakaian) {
  for (const item of pemakaian) {
    await koneksi.query(
      `INSERT INTO produksi_detail
       (id_produksi, id_resep, id_bahan, nama_bahan_snapshot, jumlah_per_batch,
        satuan_snapshot, jumlah_batch_snapshot, jumlah_pemakaian, urutan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idProduksi, item.idResep ?? null, item.idBahan ?? null, item.namaBahan,
       item.jumlahPerBatch, item.satuan, item.jumlahBatch, item.jumlah, item.urutan]
    );
  }
}

async function ambilSnapshot(koneksi, idProduksi) {
  const [rows] = await koneksi.query(
    `${SELECT_DETAIL} WHERE id_produksi = ? ORDER BY urutan, id_detail FOR UPDATE`,
    [idProduksi]
  );

  if (!rows.length) throw badRequest(PESAN_TANPA_SNAPSHOT);
  return rows;
}

// ============================================================
// GET /api/produksi — riwayat produksi
// ============================================================
export const daftarProduksi = asyncHandler(async (req, res) => {
  const { tanggal_mulai, tanggal_selesai, produk } = req.query;
  const klausa = [];
  const nilai = [];

  if (tanggal_mulai) { klausa.push('tanggal >= ?'); nilai.push(tanggal_mulai); }
  if (tanggal_selesai) { klausa.push('tanggal <= ?'); nilai.push(tanggal_selesai); }
  if (produk) { klausa.push('produk = ?'); nilai.push(produk); }

  const where = klausa.length ? `WHERE ${klausa.join(' AND ')}` : '';
  const [rows] = await db.query(
    `${SELECT_PRODUKSI} ${where} ORDER BY tanggal DESC, id_produksi DESC`,
    nilai
  );

  res.json({ success: true, data: rows.map(mapProduksi) });
});

// ============================================================
// GET /api/produksi/:id
// ============================================================
export const detailProduksi = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query(
    `${SELECT_PRODUKSI} WHERE id_produksi = ?`,
    [id]
  );

  if (!rows.length) throw notFound('Catatan produksi tidak ditemukan.');

  const [detail] = await db.query(
    `${SELECT_DETAIL} WHERE id_produksi = ? ORDER BY urutan, id_detail`,
    [id]
  );

  res.json({
    success: true,
    data: {
      ...mapProduksi(rows[0]),
      detail: detail.map((d) => ({
        idResep: d.id_resep,
        idBahan: d.id_bahan,
        namaBahan: d.nama_bahan_snapshot,
        jumlahPerBatch: Number(d.jumlah_per_batch),
        satuan: d.satuan_snapshot,
        jumlahBatch: Number(d.jumlah_batch_snapshot),
        jumlahPemakaian: Number(d.jumlah_pemakaian),
        urutan: Number(d.urutan),
      })),
    },
  });
});

// ============================================================
// POST /api/produksi — catat batch baru + simpan snapshot + kurangi stok
// ============================================================
export const tambahProduksi = asyncHandler(async (req, res) => {
  const p = req.dataValid;
  const koneksi = await db.getConnection();
  let jumlahHasil = 0;
  let pemakaian = [];

  try {
    await koneksi.beginTransaction();

    const { rows: resep, hasilPerBatch } = await ambilResepProduk(koneksi, p.produk);
    pemakaian = hitungPemakaian(resep, p.jumlahBatch);
    await terapkanStok(koneksi, pemakaian, -1);

    jumlahHasil = p.jumlahBatch * hasilPerBatch;

    await koneksi.query(
      `INSERT INTO produksi
       (id_produksi, tanggal, produk, jumlah_batch, jumlah_hasil,
        hasil_per_batch_snapshot, sumber_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.tanggal, p.produk, p.jumlahBatch, jumlahHasil,
       hasilPerBatch, 'terverifikasi']
    );

    await simpanDetail(koneksi, p.id, pemakaian);
    await koneksi.commit();
  } catch (error) {
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();
  }

  res.status(201).json({
    success: true,
    message: 'Produksi berhasil dicatat. Snapshot resep disimpan dan stok bahan disesuaikan.',
    data: { id: p.id, jumlahHasil, pemakaian },
  });
});

// ============================================================
// PUT /api/produksi/:id — ubah catatan produksi
// Stok lama dikembalikan dari snapshot, BUKAN dari resep terbaru.
// ============================================================
export const ubahProduksi = asyncHandler(async (req, res) => {
  const p = req.dataValid;
  const id = req.params.id;
  const koneksi = await db.getConnection();
  let jumlahHasil = 0;

  try {
    await koneksi.beginTransaction();

    const [lama] = await koneksi.query(
      `SELECT id_produksi FROM produksi WHERE id_produksi = ? FOR UPDATE`,
      [id]
    );
    if (!lama.length) throw notFound('Catatan produksi tidak ditemukan.');

    // 1. Kembalikan stok memakai snapshot lama.
    const snapshotLama = await ambilSnapshot(koneksi, id);
    await terapkanStok(koneksi, pemakaianDariSnapshot(snapshotLama), +1);
    await koneksi.query('DELETE FROM produksi_detail WHERE id_produksi = ?', [id]);

    // 2. Potong stok memakai resep terbaru untuk hasil edit.
    const { rows: resepBaru, hasilPerBatch } = await ambilResepProduk(koneksi, p.produk);
    const pemakaianBaru = hitungPemakaian(resepBaru, p.jumlahBatch);
    await terapkanStok(koneksi, pemakaianBaru, -1);

    jumlahHasil = p.jumlahBatch * hasilPerBatch;

    const [result] = await koneksi.query(
      `UPDATE produksi
       SET tanggal = ?, produk = ?, jumlah_batch = ?, jumlah_hasil = ?,
           hasil_per_batch_snapshot = ?, sumber_snapshot = 'terverifikasi'
       WHERE id_produksi = ?`,
      [p.tanggal, p.produk, p.jumlahBatch, jumlahHasil, hasilPerBatch, id]
    );
    if (result.affectedRows === 0) throw notFound('Catatan produksi tidak ditemukan.');

    await simpanDetail(koneksi, id, pemakaianBaru);
    await koneksi.commit();
  } catch (error) {
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();
  }

  res.json({
    success: true,
    message: 'Produksi berhasil diperbarui. Snapshot dan stok bahan telah disesuaikan.',
    data: { id, jumlahHasil },
  });
});

// ============================================================
// DELETE /api/produksi/:id — hapus + kembalikan stok dari snapshot
// ============================================================
export const hapusProduksi = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const koneksi = await db.getConnection();

  try {
    await koneksi.beginTransaction();

    const [lama] = await koneksi.query(
      `SELECT id_produksi FROM produksi WHERE id_produksi = ? FOR UPDATE`,
      [id]
    );
    if (!lama.length) throw notFound('Catatan produksi tidak ditemukan.');

    const snapshot = await ambilSnapshot(koneksi, id);
    await terapkanStok(koneksi, pemakaianDariSnapshot(snapshot), +1);

    await koneksi.query('DELETE FROM produksi_detail WHERE id_produksi = ?', [id]);
    const [result] = await koneksi.query(
      'DELETE FROM produksi WHERE id_produksi = ?',
      [id]
    );
    if (result.affectedRows === 0) throw notFound('Catatan produksi tidak ditemukan.');

    await koneksi.commit();
  } catch (error) {
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();
  }

  res.json({ success: true, message: 'Catatan produksi berhasil dihapus. Stok dikembalikan dari snapshot.' });
});
