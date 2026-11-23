// ======================================================
// STRUKTUR DATA: ARRAY / LIST
// Tujuan:
// Menyediakan operasi dasar untuk kumpulan data Brookies
// (transaksi, pengeluaran, bahan, resep, dan produksi)
// tanpa mengubah array asal.
//
// Data yang disimpan:
// Array of object. Setiap objek memiliki properti `id` yang
// dipakai sebagai penanda saat mencari, mengubah, atau menghapus.
//
// Operasi:
// 1. tambahItem() — menambah item di akhir list
// 2. ubahItem()   — memperbarui item berdasarkan id
// 3. hapusItem()  — membuang item berdasarkan id
// 4. cariItem()   — mencari item berdasarkan id
//
// Cara kerja singkat:
// Setiap fungsi memakai method array native yang menghasilkan
// array/objek BARU (spread, map, filter, find), sehingga data lama
// tidak pernah dimutasi. Ini penting karena React membandingkan
// referensi untuk memutuskan apakah tampilan perlu diperbarui.
//
// Penggunaan:
// Dipanggil oleh `src/features/shared/crud.js` pada jalur CRUD:
// susunItem() memakai tambahItem/ubahItem/cariItem untuk merakit
// payload sebelum dikirim ke API, dan delEntity() memakai
// cariItem + hapusItem untuk validasi sebelum/ sesudah hapus.
// Backend tetap menjadi sumber kebenaran data (MySQL).
// ======================================================

/**
 * Menambah satu item ke akhir list.
 * @param {Array<{id: string}>} list - List sebelum perubahan.
 * @param {object} item - Item baru yang memiliki `id`.
 * @returns {Array} List baru dengan item di posisi terakhir.
 */
export const tambahItem = (list, item) => [...list, item]

/**
 * Mengubah item yang `id`-nya cocok, tanpa menyentuh item lain.
 * @param {Array<{id: string}>} list - List sebelum perubahan.
 * @param {string} id - Id item yang ingin diperbarui.
 * @param {object} perubahan - Properti yang akan ditimpa.
 * @returns {Array} List baru; item lain tetap referensinya.
 */
export const ubahItem = (list, id, perubahan) => list.map(x => x.id === id ? { ...x, ...perubahan } : x)

/**
 * Menghapus semua item dengan id tertentu dari list.
 * @param {Array<{id: string}>} list - List sebelum perubahan.
 * @param {string} id - Id item yang ingin dihapus.
 * @returns {Array} List baru tanpa item tersebut.
 */
export const hapusItem = (list, id) => list.filter(x => x.id !== id)

/**
 * Mencari item pertama yang id-nya cocok.
 * @param {Array<{id: string}>} list - List yang dicari.
 * @param {string} id - Id yang dicari.
 * @returns {object|undefined} Item ditemukan, atau undefined.
 */
export const cariItem = (list, id) => list.find(x => x.id === id)
