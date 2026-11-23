// ============================================================
// PENYIMPANAN TOKEN LOGIN — Tahap E
// ------------------------------------------------------------
// CATATAN PENTING:
// File ini DULU dipakai untuk menyimpan data usaha (transaksi,
// pengeluaran, produksi) ke localStorage. Sekarang tidak lagi.
// Data operasional disimpan di MySQL melalui API.
// Yang disimpan di sini HANYA token JWT untuk sesi login admin.
// ============================================================

const KUNCI_TOKEN = 'brookies_token';

// Ambil token dari browser (null jika belum login).
export function ambilToken() {
  try {
    return localStorage.getItem(KUNCI_TOKEN);
  } catch {
    return null;
  }
}

// Simpan token setelah login berhasil.
export function simpanToken(token) {
  try {
    localStorage.setItem(KUNCI_TOKEN, token);
  } catch {
    // Jika localStorage diblokir, user tetap bisa login di sesi ini.
  }
}

// Hapus token saat logout atau sesi kedaluwarsa.
export function hapusToken() {
  try {
    localStorage.removeItem(KUNCI_TOKEN);
  } catch {
    // Abaikan error akses localStorage.
  }
}
