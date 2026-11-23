// ======================================================
// STRUKTUR DATA: TREE
// Tujuan:
// Menyusun laporan keuntungan Brookies menjadi hierarki yang
// mudah dibaca: Laporan → Tahun → Bulan → Hari.
//
// Jenis Tree berdasarkan kode:
// Tree berakar (root) dan TIDAK biner. Setiap node memiliki
// array `anak`, sehingga jumlah child tidak dibatasi dua
// (sering disebut general tree / n-ary tree).
//
// Struktur node (class NodeLaporan):
// - tingkat : 'root' | 'tahun' | 'bulan' | 'hari'
// - label   : teks tampilan (tahun/bulan/hari diambil dari
//             `tanggal.split('-')`, sehingga bulan berupa '01', '02', ...)
// - income  : akumulasi pendapatan
// - expense : akumulasi pengeluaran
// - profit  : income - expense
// - anak    : array node anak
//
// Relasi parent → child:
// Hanya satu arah, lewat `anak`. TIDAK ada pointer `parent`,
// tidak ada method hapusAnak/cariAnak publik.
//
// Proses pembentukan:
// 1. Buat satu node akar bertingkat 'root'.
// 2. Untuk setiap transaksi BERSTATUS 'Selesai', masukkan `total`
//    sebagai income ke node hari yang sesuai dengan tanggalnya.
// 3. Untuk setiap pengeluaran, masukkan `total` sebagai expense.
// 4. `dapatkan()` mencari anak berdasarkan label secara linear;
//    bila belum ada, node baru dibuat dan ditambahkan (tambahAnak).
//
// Traversal / pencarian:
// - Pencarian node: `dapatkan()`, hanya pada anak langsung dan
//   hanya membandingkan `label` (pencarian linear).
// - Traversal: `hitung()` rekursif POST-ORDER (anak diproses dulu).
//   Nilai income/expense anak dijumlahkan ke parent, lalu profit
//   dihitung. TIDAK ada BFS/DFS generik atau fungsi cariNode
//   yang diekspor.
//
// Penggunaan:
// Satu-satunya pemanggil adalah `src/hooks/useDerivedData.js:12`
// (`bangunTreeLaporan(...)` di dalam useMemo). Hasilnya diteruskan
// lewat App.jsx ke `src/features/laporan/Laporan.jsx`, yang
// merender `laporan.anak` (tahun) → `y.anak` (bulan) → `m.anak`
// (hari) memakai tag <details> bertingkat.
// Backend hanya menyiapkan array transaksi/pengeluaran dengan
// format yang sesuai (lihat laporanController.js baris 236).
// ======================================================

/**
 * Node tunggal pada tree laporan.
 */
export class NodeLaporan{
  /**
   * @param {string} tingkat - 'root' | 'tahun' | 'bulan' | 'hari'.
   * @param {string} label - Teks tampilan node.
   */
  constructor(tingkat,label){this.tingkat=tingkat;this.label=label;this.income=0;this.expense=0;this.profit=0;this.anak=[]}
  /**
   * Menambahkan node anak dan mengembalikannya agar bisa dipakai langsung.
   * @param {NodeLaporan} node - Node anak.
   * @returns {NodeLaporan} Node yang baru ditambahkan.
   */
  tambahAnak(node){this.anak.push(node);return node}
}
/**
 * Membangun tree laporan dari dua array data mentah.
 * @param {Array<object>} transaksi - Transaksi; hanya status 'Selesai' dihitung.
 * @param {Array<object>} pengeluaran - Semua pengeluaran dihitung.
 * @returns {NodeLaporan} Node akar beserta seluruh turunannya.
 */
export function bangunTreeLaporan(transaksi,pengeluaran){
  const akar=new NodeLaporan('root','Laporan')
  // Cari child berdasarkan label; buat baru bila belum ada.
  const dapatkan=(parent,tingkat,label)=>{let n=parent.anak.find(x=>x.label===label);return n||parent.tambahAnak(new NodeLaporan(tingkat,label))}
  // Turunkan nilai ke level hari sesuai tanggal YYYY-MM-DD.
  const masukkan=(tanggal,jenis,nilai)=>{
   if(!tanggal)return
   const [tahun,bulan,hari]=tanggal.split('-')
   const t=dapatkan(akar,'tahun',tahun),b=dapatkan(t,'bulan',bulan),h=dapatkan(b,'hari',hari)
   h[jenis]+=nilai
  }
  transaksi.filter(x=>x.status==='Selesai').forEach(x=>masukkan(x.tanggal,'income',Number(x.total)||0))
  pengeluaran.forEach(x=>masukkan(x.tanggal,'expense',Number(x.total)||0))
  // Post-order: agregat anak ke parent, lalu hitung profit.
  const hitung=n=>{n.anak.forEach(hitung);if(n.anak.length){n.income=n.anak.reduce((s,x)=>s+x.income,0);n.expense=n.anak.reduce((s,x)=>s+x.expense,0)}n.profit=n.income-n.expense}
  hitung(akar);return akar
}
