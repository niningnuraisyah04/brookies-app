// ======================================================
// ALGORITMA: BUBBLE SORT
// Tujuan:
// Mengurutkan data tabel Brookies berdasarkan satu properti
// tanpa mengubah array asal yang diterima dari state/API.
//
// Data yang diurutkan:
// Array of object, misalnya daftar transaksi, pengeluaran,
// bahan baku, atau resep. Properti yang dipakai antara lain
// 'tanggal', 'nama', dan 'produk'.
//
// Cara kerja:
// 1. Salin data dengan `[...data]` → array asli tidak dimutasi.
// 2. Tentukan faktor arah: -1 untuk 'desc', selain itu +1 ('asc').
// 3. Lakukan pass berulang; pada setiap pass, bandingkan pasangan
//    elemen bersebelahan.
// 4. Perbandingan:
//    - bila dua nilai bertipe number → selisih `a - b`;
//    - selain itu → `localeCompare` dengan locale 'id' dan
//      opsi { numeric: true } (angka dalam teks diurutkan wajar,
//      misal BH-2 sebelum BH-10).
// 5. Pertukaran posisi terjadi hanya bila `banding * faktor > 0`.
//    Elemen dengan nilai sama TIDAK ditukar (sort stabil).
//
// Kondisi berhenti:
// Loop berhenti setelah `n-1` pass dan jendela perbandingan
// menyusut (`j < hasil.length - i - 1`). Implementasi ini
// TIDAK memakai flag `swapped` / early exit, jadi walaupun data
// sudah terurut, perbandingan tetap dilakukan penuh.
//
// Kompleksitas sesuai implementasi aktual:
// - Best case  : O(n²) — tidak ada early exit.
// - Average    : O(n²) — n(n-1)/2 perbandingan.
// - Worst case : O(n²) — pass penuh + pertukaran tiap pasangan.
// - Ruang      : O(n) karena menyalin array.
//
// Penggunaan:
// - `src/features/bahan-baku/BahanBaku.jsx:16` → urut nama bahan.
// - `src/features/pengeluaran/Pengeluaran.jsx:13` → tanggal terbaru.
// - `src/features/transaksi/Transaksi.jsx:14` → tanggal, arah dari
//   tombol toggle `sortDir` di halaman Transaksi.
// - `src/features/resep/Resep.jsx:10` → urut nama produk.
// Hasilnya hanya dipakai untuk urutan tampilan tabel; tidak ada
// hasil pengurutan yang ditulis kembali ke API/database.
// ======================================================

/**
 * Mengurutkan salinan array berdasarkan properti tertentu.
 * @param {Array<object>} data - Data sumber (tidak dimutasi).
 * @param {string} properti - Nama properti yang dipakai sebagai kunci.
 * @param {'asc'|'desc'} arah - Arah urut; default 'asc'.
 * @returns {Array<object>} Array baru yang sudah terurut.
 */
export function bubbleSort(data, properti, arah = 'asc') {
  const hasil = [...data], faktor = arah === 'desc' ? -1 : 1
  for (let i = 0; i < hasil.length - 1; i++) for (let j = 0; j < hasil.length - i - 1; j++) {
    const a = hasil[j][properti], b = hasil[j + 1][properti]
    const banding = typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a ?? '').localeCompare(String(b ?? ''), 'id', { numeric: true })
    if (banding * faktor > 0) [hasil[j], hasil[j + 1]] = [hasil[j + 1], hasil[j]]
  }
  return hasil
}
