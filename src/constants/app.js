// KONSTANTA APLIKASI — dipindahkan dari App.jsx (Tahap 8).
// Nilai dan urutan tidak diubah.

export const status=['Diterima','Diproses','Selesai','Dibatalkan']

// Dihitung sekali saat modul dimuat agar tidak memanggil Date saat render React.
export const TAHUN_SEKARANG = new Date().getFullYear()

// Satu pesan 401 yang dipakai frontend; backend middleware memakai teks yang sama.
export const PESAN_SESI_BERAKHIR = 'Sesi login berakhir. Silakan login kembali.'
export const saluran=['WhatsApp','Instagram','GrabFood','GoFood','Penitipan Kafe','CFD','Langsung']
export const kategoriPengeluaran=['Bahan Baku','Operasional']

// Kondisi awal kosong. Data langsung dimuat dari MySQL setelah login.
export const dataAwal=()=>({transaksi:[],pengeluaran:[],dataBahan:new Map(),resep:[],produksi:[]})
