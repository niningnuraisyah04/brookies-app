// ======================================================
// STRUKTUR DATA: HASH MAP
// Tujuan:
// Menyediakan pencarian bahan baku berdasarkan ID secara cepat
// (misalnya "BH-001") tanpa harus memindai seluruh daftar.
//
// Catatan penting tentang implementasi:
// Modul ini adalah pembungkus (wrapper) tipis di atas `Map` native
// JavaScript. Di sini TIDAK ada fungsi hash, bucket, kolisi, atau
// resizing buatan sendiri. Jadi penyebutan "Hash Map" merujuk pada
// perilaku `Map` native: key → value dengan akses langsung.
//
// Bentuk key dan value:
// - key   : `b.id`, yaitu ID bahan baku (string, contoh "BH-001").
// - value : objek bahan hasil salinan dangkal, berisi
//           id, nama, stok, satuan, minimum, kebutuhanBulanan,
//           hargaBahan (lihat pemanggilan di useAppData.js baris 27).
//
// Operasi:
// 1. buatHashMapBahan() — mengisi Map dari array bahan (INSERT)
// 2. cariBahan()        — mengambil value berdasarkan key (GET)
// 3. ubahStokBahan()    — memperbarui stok pada key tertentu (UPDATE)
//
// Cara kerja:
// - `new Map(...)` membuat tabel hash; id yang sama akan menimpa
//   value lama (mirip primary key di database).
// - `map.get(id)` langsung mengembalikan value tanpa perulangan.
// - `ubahStokBahan` menolak id yang tidak ada dan stok negatif,
//   lalu menyimpan objek baru dengan `map.set()`.
//
// Penggunaan aktual di aplikasi:
// - `src/hooks/useAppData.js:27` membuat Map dari response API,
//   lalu disimpan sebagai `data.dataBahan` (baris 41).
// - `src/hooks/useDerivedData.js:9` mengubah isi Map menjadi array
//   `allBahan` untuk ditampilkan pada tabel/dropdown.
// - `src/features/shared/crud.js:74` dan
//   `src/features/shared/EntityModal.jsx:14` memanggil
//   `dataBahan.get(idBahan)` saat menyusun pengeluaran.
// - `src/features/resep/Resep.jsx:10` memakai `.get()` untuk
//   menerjemahkan idBahan menjadi nama bahan di tabel resep.
// - `src/constants/app.js:15` menyiapkan `new Map()` kosong sebagai
//   nilai awal sebelum data selesai dimuat.
//
// Fungsi `cariBahan()` dan `ubahStokBahan()` saat ini hanya tersedia
// sebagai utilitas dan BELUM dipanggil komponen mana pun. Penyesuaian
// stok yang sebenarnya terjadi di backend MySQL (bukan di browser).
//
// Keuntungan di proyek Brookies:
// Saat form pengeluaran/resep menerima idBahan, aplikasi cukup
// satu kali `.get(id)` untuk mendapatkan nama, satuan, dan harga.
// Kompleksnya O(1) rata-rata, dibanding O(n) bila memakai
// `array.find()` pada setiap baris resep.
// ======================================================

/**
 * Membuat Map bahan baku dari array.
 * @param {Array<object>} daftar - Daftar bahan; tiap elemen punya `id`.
 * @returns {Map<string, object>} Map dengan key = id dan value = salinan objek.
 */
export const buatHashMapBahan = (daftar = []) => new Map(daftar.map(b => [b.id, { ...b }]))

/**
 * Mencari bahan berdasarkan id.
 * @param {Map<string, object>} map - Map bahan baku.
 * @param {string} id - Id bahan yang dicari.
 * @returns {object|undefined} Data bahan, atau undefined bila tidak ada.
 */
export const cariBahan = (map, id) => map.get(id)

/**
 * Menambahkan/mengurangi stok bahan pada Map (dimutasi di tempat).
 * @param {Map<string, object>} map - Map bahan baku.
 * @param {string} id - Id bahan yang akan diubah.
 * @param {number} delta - Penambah stok; negatif berarti pengurangan.
 * @returns {object} Value terbaru setelah perubahan.
 * @throws {Error} Bila id tidak ditemukan atau stok menjadi negatif.
 */
export function ubahStokBahan(map, id, delta) {
  const bahan = map.get(id); if (!bahan) throw new Error(`Bahan ${id} tidak ditemukan`)
  const stok = bahan.stok + delta; if (stok < 0) throw new Error(`Stok ${bahan.nama} tidak mencukupi`)
  map.set(id, { ...bahan, stok }); return map.get(id)
}
