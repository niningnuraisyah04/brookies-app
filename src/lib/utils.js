// UTILITAS TAMPILAN YANG DIPAKAI BERSAMA
// `rupiah` dan `tanggalID` adalah satu-satunya formatter untuk mata uang
// dan tanggal di frontend. Pemakaian terpusat mencegah beda format antar halaman.
// `cn` adalah pembantu kelas CSS dari template awal; saat ini tidak dipanggil,
// tetapi sengaja dipertahankan agar komponen tambahan bisa menggunakannya.
export const cn = (...daftar) => daftar.filter(Boolean).join(' ')
export const rupiah = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n) || 0)
export const tanggalID = s => s ? new Date(`${s}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
