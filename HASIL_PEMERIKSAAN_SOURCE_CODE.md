# Laporan Pemeriksaan Source Code — Struktur Data & Algoritma Brookies

**Tanggal:** 25 November 2026  
**Proyek:** Brookies management app  
**Branch:** `main`  
**Commit source yang diperiksa:** `9adeb541120ef7088ae9172869591d80c8513390` (`Security hardening and production deployment preparation`)  
**Sifat pemeriksaan:** read-only terhadap source code, database, dan konfigurasi. Saat audit awal, satu-satunya file yang dibuat adalah laporan ini; pembaruan berikutnya menambahkan empat file test di folder `tests/` sebagai bukti pengujian terbaru (Bagian 3A). Tidak ada operasi CRUD ke database. Laporan ini dibuat setelah commit tersebut di atas dan masih merupakan file lokal yang belum di-commit.

---

## 1. Tujuan Pemeriksaan Source Code

Tujuan pemeriksaan ini adalah membuktikan bahwa empat konsep yang dipersyaratkan benar-benar:

1. **Diimplementasikan** di dalam source code proyek Brookies, bukan hanya disebut dalam dokumentasi.
2. **Digunakan dalam alur aplikasi**, yaitu terhubung ke fitur nyata (CRUD, laporan, pengeluaran, resep, produksi).
3. **Dapat diuji secara deterministik** tanpa bergantung pada data produksi.

Konsep yang diperiksa:

| No | Konsep | File utama |
|---|---|---|
| 1 | Array/List | `src/structures/arrayList.js` |
| 2 | Hash Map | `src/structures/hashMap.js` |
| 3 | Tree | `src/structures/tree.js` |
| 4 | Bubble Sort | `src/algorithms/bubbleSort.js` |

---

## 2. Metode Pemeriksaan dan Pengujian In-Memory

Pemeriksaan dilakukan dengan langkah-langkah berikut:

1. **Penemuan file** menggunakan pencarian path untuk `arrayList.js`, `hashMap.js`, `tree.js`, dan `bubbleSort.js`.
2. **Penelusuran statis** menggunakan pencarian teks terhadap nama fungsi dan import/pemanggilan di seluruh direktori `src/` dan `server/`.
3. **Pembacaan source code** dengan menampilkan nomor baris asli, sehingga bukti dapat dikutip langsung.
4. **Pengujian in-memory** dengan meng-import modul ESM secara langsung melalui URL `file:///...` menggunakan `node --input-type=module`.
   - Tidak ada server yang dijalankan.
   - Tidak ada koneksi database.
   - Tidak ada file yang ditulis oleh proses pengujian.
   - Assertion dibuat di dalam memori menggunakan data sampel buatan.
5. **Referensi silang** dengan dokumentasi proyek (`DOKUMENTASI_STRUKTUR_DATA.md`, `PETA_SOURCE_CODE.md`), tetapi bukti utama tetap diambil dari source code.

Referensi dokumen proyek yang tersedia dan relevan:

| Dokumen | Baris | Hubungan dengan pemeriksaan |
|---|---|---|
| `DOKUMENTASI_STRUKTUR_DATA.md` | 11-16 | Memetakan keempat struktur/algoritma ke file implementasi dan pemanggil langsungnya |
| `DOKUMENTASI_STRUKTUR_DATA.md` | 130-136 | Mencatat `new Map()` sebagai nilai awal serta menyatakan `cariBahan()`/`ubahStokBahan()` belum dipanggil komponen mana pun; sinkronisasi stok terjadi di backend MySQL |
| `DOKUMENTASI_STRUKTUR_DATA.md` | 217-218 | Menyatakan `bubbleSort.js` dipakai untuk tabel transaksi, pengeluaran, bahan baku, dan resep |
| `PETA_SOURCE_CODE.md` | 112-114 | Daftar `arrayList.js`, `hashMap.js`, dan `tree.js` beserta perannya |
| `PETA_SOURCE_CODE.md` | 203-206 | Daftar `bubbleSort.js`, `arrayList.js`, `hashMap.js`, dan `tree.js` serta tanggung jawabnya |
| `PETA_SOURCE_CODE.md` | 342, 347-350 | Alur `buatHashMapBahan()` → `data.dataBahan` → `allBahan` dan alur hapus `cariItem` → `hapusItem` → `cariItem` |

Ringkasan status akhir per konsep:

| Konsep | Status |
|---|---|
| Array/List | **TERBUKTI** |
| Hash Map | **TERBUKTI** untuk `Map`, key ID bahan, dan pencarian; **BELUM TERBUKTI** untuk integrasi `ubahStokBahan()` pada proses produksi |
| Tree | **TERBUKTI** |
| Bubble Sort | **TERBUKTI** |

Catatan: status di atas berasal dari verifikasi statis dan pengujian unit in-memory. Keduanya **bukan pengganti pengujian runtime/UI**; integrasi end-to-end pada aplikasi yang berjalan belum diuji dalam pemeriksaan ini.

---

## 3. Hasil Pengujian Otomatis

Sebanyak **28 pemeriksaan otomatis** dijalankan. Hasilnya: **28 lulus, 0 gagal**.

| Bagian | Jumlah pemeriksaan | Contoh yang diverifikasi |
|---|---:|---|
| Array/List | 6 | Penambahan tanpa mutasi array asli, update by id, hapus by id, pencarian first-match |
| Hash Map | 6 | `Map` terbuat, key = id bahan, `get()` membaca data, `ubahStokBahan()` menolak stok negatif dan id tidak ada |
| Tree | 10 | Hierarki tahun → bulan → hari, akumulasi income/expense/profit, agregasi post-order, transaksi `Pending` diabaikan |
| Bubble Sort | 6 | Ascending, descending, array asli tidak berubah, perbandingan angka, stabilitas |
| **Total** | **28** | **28 lulus, 0 gagal** |

Output ringkas dari proses pengujian:

```json
{
  "total": 28,
  "passed": 28,
  "failed": [],
  "sampleTree": {
    "tahun": ["2026", "2025"],
    "akar": { "income": 350, "expense": 80, "profit": 270 }
  },
  "sorted": {
    "asc": ["BH-1", "BH-2", "BH-10"],
    "desc": ["BH-10", "BH-2", "BH-1"]
  }
}
```

Bukti tertulis yang tersedia untuk angka tersebut adalah **ringkasan** di atas: `total = 28`, `passed = 28`, `failed = []`, rincian jumlah per kategori, serta contoh hasil tree dan sorting. **Daftar nama ke-28 pemeriksaan tidak tercatat dalam bukti yang tersedia**, sehingga laporan ini tidak mengarang nama pemeriksaan individual.

Sebagai pembanding, `DOKUMENTASI_PERUBAHAN.md:261` mencatat **`tahap15b_structures_full.mjs` dengan 21 assertion lulus** pada tahap pengembangan sebelumnya. Angka itu berasal dari tahap dan skrip yang berbeda, sehingga tidak dipakai sebagai daftar 28 pemeriksaan pada laporan ini.

**Catatan pembeda:** 28 pemeriksaan di atas adalah catatan pengujian in-memory lama. Pengujian otomatis terbaru dengan **71 test** dibahas terpisah di **Bagian 3A**. Keduanya tidak dijumlahkan.

Data sampel tree yang dipakai:

- Transaksi: `2026-11-01` sebesar `100` dan `50` berstatus `Selesai`; `2026-11-02` sebesar `200` berstatus `Selesai`; `2026-11-02` sebesar `999` berstatus `Pending`.
- Pengeluaran: `2026-11-01` sebesar `30`, `2026-11-02` sebesar `40`, `2025-12-05` sebesar `10`.
- Hasil: akar `income = 350`, `expense = 80`, `profit = 270`; transaksi `Pending` tidak ikut dihitung.

## 3A. Pengujian Otomatis Struktur Data dan Algoritma

Bagian ini mencatat pengujian otomatis terbaru yang dijalankan setelah empat file test dibuat. Ini adalah **catatan pengujian yang berbeda** dari 28 pemeriksaan in-memory pada Bagian 3 dan dari 21 assertion Tahap 15B; ketiganya tidak digabungkan.

**Sumber bukti:**

- `tests/arrayList.test.js` — 21 test
- `tests/hashMap.test.js` — 20 test
- `tests/tree.test.js` — 14 test
- `tests/bubbleSort.test.js` — 16 test

**Perintah untuk menjalankan ulang:**

```powershell
node --test --test-reporter=spec tests
```

Pengujian memakai **`node:test`** dan **`node:assert/strict`** dari runtime Node.js. **Tidak ada dependency baru** yang dipasang dan `package.json` tidak diubah. Sifatnya adalah **unit testing modul murni**: tidak menguji UI/React, tidak memanggil API, tidak menjalankan server, dan tidak membuka koneksi database. Seluruh data yang dipakai adalah simulasi lokal.

### Tabel hasil per modul

| Modul | File test | Jumlah test | Hasil | Cakupan utama |
|---|---|---:|---|---|
| Array/List | `tests/arrayList.test.js` | 21 | 21 lulus, 0 gagal | Keempat fungsi ekspor; immutability; perbandingan id strict; duplikat id; array kosong; input `null`; error; kombinasi tambah → ubah → cari → hapus |
| Hash Map | `tests/hashMap.test.js` | 20 | 20 lulus, 0 gagal | `buatHashMapBahan`, `cariBahan`, `ubahStokBahan`; key = id; duplikat; tipe key; `.get()` native; stok 0 dan negatif; id tidak ada; nilai falsy; tanpa konversi `Number`; kombinasi alur |
| Tree | `tests/tree.test.js` | 14 | 14 lulus, 0 gagal | `NodeLaporan`, konstruktor, `tambahAnak`, chaining, hierarki akar → tahun → bulan → hari, filter status `Selesai`, tanggal kosong, total bukan angka/negatif, agregasi rekursif post-order, node duplikat |
| Bubble Sort | `tests/bubbleSort.test.js` | 16 | 16 lulus, 0 gagal | `bubbleSort`; immutability; ascending/descending; arah selain `desc`; `localeCompare` numeric locale `id`; stabilitas; `undefined`/`null`; array kosong/satu elemen; pass penuh tanpa early exit; error; kombinasi filter + sort |
| **Total** | | **71** | **71 lulus, 0 gagal, 0 skipped** | **197.2505 ms** |

### Ringkasan hasil aktual

Output ringkas dari perintah di atas:

```text
ℹ tests 71
ℹ suites 0
ℹ pass 71
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 197.2505
```

Ringkasannya: **Total 71, passed 71, failed 0, skipped 0, duration 197.2505 ms**.

### Cakupan pengujian per modul

- **Array/List — 21 test.** Menguji seluruh fungsi yang diekspor: `tambahItem`, `ubahItem`, `hapusItem`, dan `cariItem`. Skenario meliputi array asli yang tidak dimutasi, item tanpa `id`, `id` duplikat, `id` bertipe berbeda, perubahan yang menimpa `id`, perubahan `null`, array kosong, input bukan array, elemen `null`, dan kombinasi alur CRUD pada daftar kerja.
- **Hash Map — 20 test.** Menguji seluruh fungsi yang diekspor: `buatHashMapBahan`, `cariBahan`, dan `ubahStokBahan`. Skenario meliputi `Map` kosong, key = `id`, duplikat `id` dengan nilai terakhir menang, key dengan tipe berbeda, item tanpa `id`, kesetaraan `cariBahan()` dengan `.get()` native, `undefined` untuk key yang tidak ada, penambahan/pengurangan stok, stok tepat 0, penolakan stok negatif, penolakan id tidak ada, nilai falsy, serta perilaku `+` tanpa konversi `Number`. Pengujian ini kembali membuktikan **`ubahStokBahan()` lolos unit test**, tetapi fungsi itu tetap **belum memiliki pemanggil dalam alur produksi utama**; stok produksi diperbarui oleh backend MySQL (lihat Bagian 7).
- **Tree — 14 test.** Menguji `NodeLaporan`, konstruktor, `tambahAnak`, urutan anak, perilaku chaining, array `anak` per instance, ketiadaan pointer `parent` dan method hapus/cari publik, serta `bangunTreeLaporan`. Skenario `bangunTreeLaporan` mencakup input kosong, hierarki `root → tahun → bulan → hari`, akumulasi beberapa transaksi pada tanggal sama, agregasi rekursif post-order, filter status persis `Selesai`, pengabaian tanggal kosong, total bukan angka menjadi 0, nilai negatif, dan pencegahan node duplikat.
- **Bubble Sort — 16 test.** Menguji `bubbleSort` dengan skenario asc/desc, arah selain `desc` yang diperlakukan ascending, perbandingan angka, perbandingan teks memakai `localeCompare(..., 'id', { numeric: true })`, campuran number/string, stabilitas pada nilai sama, `undefined`/`null` menjadi string kosong, array kosong dan satu elemen, array asli yang tidak dimutasi, pembuktian pass penuh tanpa early exit, error input `null`/`undefined` dan elemen `null`, serta kombinasi filter lalu sort.

### Hubungan dengan catatan pengujian lain

| Catatan | Sumber | Keterangan |
|---|---|---|
| 28 pemeriksaan in-memory | Bagian 3 dari audit awal | Ringkasan lama; daftar nama per pemeriksaan tidak tersedia |
| 21 assertion Tahap 15B | `tahap15b_structures_full.mjs`, disebut dalam `DOKUMENTASI_PERUBAHAN.md` | Catatan tahap sebelumnya; skrip tidak tersedia di working tree saat ini |
| 71 test terbaru | Empat file di `tests/` | Dapat dijalankan ulang dengan perintah di atas |

Ketiga angka di atas adalah **catatan pengujian berbeda**. Hasil lama **28** dan hasil terbaru **71 tidak dijumlahkan menjadi 99**; 21 assertion lama juga tidak dimasukkan ke dalam 71 test terbaru.

---

## 4. Bukti Implementasi per Konsep

### 4.1 Array/List

**File:** `src/structures/arrayList.js`  
**Fungsi:** `tambahItem`, `ubahItem`, `hapusItem`, `cariItem`

Potongan kode langsung dari source:

```js
38: export const tambahItem = (list, item) => [...list, item]
47: export const ubahItem = (list, id, perubahan) => list.map(x => x.id === id ? { ...x, ...perubahan } : x)
55: export const hapusItem = (list, id) => list.filter(x => x.id !== id)
63: export const cariItem = (list, id) => list.find(x => x.id === id)
```

Potongan pemanggilan di `src/features/shared/crud.js`:

```js
33:  const susunItem=(kind,perubahan)=>{
34:   const daftar=daftarEntitas(kind)
35:   const id=perubahan.id
36:   return editing
37:    ? (cariItem(ubahItem(daftar,editing,perubahan),editing)||{...perubahan})
38:    : (cariItem(tambahItem(daftar,{id,...perubahan}),id)||{...perubahan})
39:  }
```

```js
143:  async function delEntity(key,id){
144:   const daftar=daftarEntitas(key)
145:   const item=cariItem(daftar,id)
156:    const hasil=await aksi(id)
157:    const sisa=hapusItem(daftar,id)
158:    if(cariItem(sisa,id))throw new Error('Gagal memperbarui daftar data.')
```

Catatan: baris 146–155 sengaja dihilangkan dari kutipan di atas; kutipan hanya menampilkan baris yang relevan dengan `cariItem`/`hapusItem`.

**Cara kerja:** keempat fungsi memakai operasi Array native yang menghasilkan nilai baru (`spread`, `map`, `filter`, `find`), sehingga array asli tidak dimutasi. `tambahItem` menaruh item di akhir, `ubahItem` menimpa properti item yang `id`-nya cocok, `hapusItem` membuang semua item dengan id tersebut, dan `cariItem` mengembalikan item pertama yang cocok atau `undefined`.

**Lokasi pemanggilan lain:**

| File | Baris | Pemanggilan |
|---|---:|---|
| `src/features/shared/crud.js` | 6 | Import keempat fungsi |
| `src/features/shared/crud.js` | 65 | `susunItem` untuk transaksi |
| `src/features/shared/crud.js` | 86 | `susunItem` untuk pengeluaran |
| `src/features/shared/crud.js` | 102 | `susunItem` untuk bahan baku |
| `src/features/shared/crud.js` | 111 | `susunItem` untuk resep |
| `src/features/shared/crud.js` | 121 | `susunItem` untuk produksi |
| `src/features/shared/tableHelpers.jsx` | 6 | Tombol hapus memanggil `delEntity(kind,item.id)` |

**Hasil:** **TERBUKTI** dan terintegrasi pada jalur CRUD frontend yang terverifikasi secara statis.

---

### 4.2 Hash Map

**File:** `src/structures/hashMap.js`  
**Fungsi:** `buatHashMapBahan`, `cariBahan`, `ubahStokBahan`

Potongan kode langsung dari source:

```js
60: export const buatHashMapBahan = (daftar = []) => new Map(daftar.map(b => [b.id, { ...b }]))
68: export const cariBahan = (map, id) => map.get(id)
78: export function ubahStokBahan(map, id, delta) {
79:   const bahan = map.get(id); if (!bahan) throw new Error(`Bahan ${id} tidak ditemukan`)
80:   const stok = bahan.stok + delta; if (stok < 0) throw new Error(`Stok ${bahan.nama} tidak mencukupi`)
81:   map.set(id, { ...bahan, stok }); return map.get(id)
82: }
```

Modul ini secara eksplisit merupakan pembungkus tipis di atas `Map` native JavaScript. Tidak ada fungsi hash, bucket, kolisi, atau resizing buatan sendiri.

#### Potongan Penggunaan Map Native dan .get()

*Pemanggilan fungsi dari `src/structures/hashMap.js`:*

```js
 5: import { buatHashMapBahan } from '@/structures/hashMap'
27:    const bahanMap=buatHashMapBahan(bahan.data.map(b=>({
28:     id:b.id,nama:b.nama,stok:Number(b.stok),satuan:b.satuan,
29:     minimum:Number(b.minimum),kebutuhanBulanan:Number(b.kebutuhanBulanan),
30:     hargaBahan:Number(b.hargaBahan)
31:    })))
41:     dataBahan:bahanMap
```
— `src/hooks/useAppData.js:5,27-31,41`. Ini adalah **satu-satunya pemanggilan fungsi** dari modul `hashMap.js` yang ditemukan: `buatHashMapBahan()`. Pencarian ulang menunjukkan `cariBahan()` dan `ubahStokBahan()` **belum memiliki pemanggil**.

*Penggunaan API `Map` native (bukan pemanggilan fungsi dari `hashMap.js`):*

`new Map()` sebagai nilai awal:

```js
15: export const dataAwal=()=>({transaksi:[],pengeluaran:[],dataBahan:new Map(),resep:[],produksi:[]})
```
— `src/constants/app.js:15`

Konversi isi `Map` menjadi array dengan `.entries()`:

```js
 9:  const allBahan=useMemo(()=>[...data.dataBahan.entries()].map(([id,b])=>({id,...b})),[data.dataBahan])
```
— `src/hooks/useDerivedData.js:9`

Operasi pencarian dengan `.get()` (potongan baris, bukan seluruh baris karena baris sumber sangat panjang):

```js
74:     const bahan=form.kategori===kategoriPengeluaran[0]?data.dataBahan.get(form.idBahan):null
```
— `src/features/shared/crud.js:74`

```js
const b=dataBahan.get(e.target.value);
```
— potongan dari `src/features/shared/EntityModal.jsx:16`

```js
dataBahan.get(x.idBahan)?.nama||'Bahan tidak ditemukan'
```
— potongan dari `src/features/resep/Resep.jsx:10`

**Cara kerja:** `new Map(daftar.map(b => [b.id, {...b}]))` membangun tabel hash dengan **key = ID bahan** (misalnya `BH-001`) dan value = salinan objek bahan. Pencarian memakai `map.get(id)` tanpa perulangan. `ubahStokBahan` menolak id yang tidak ada dan stok negatif, lalu menyimpan objek baru dengan `map.set()`.

**Lokasi terkait (dibedakan):**

| Jenis | File | Baris | Keterangan |
|---|---|---:|---|
| Pemanggilan fungsi modul | `src/hooks/useAppData.js` | 5, 27-31, 41 | `buatHashMapBahan()` dipanggil untuk membangun `Map` dari response API |
| Definisi tanpa pemanggil | `src/structures/hashMap.js` | 68, 78-82 | `cariBahan()` dan `ubahStokBahan()` hanya didefinisikan |
| API `Map` native | `src/constants/app.js` | 15 | `new Map()` kosong sebagai state awal |
| API `Map` native | `src/hooks/useDerivedData.js` | 9 | `.entries()` menjadi array `allBahan` |
| API `Map` native | `src/features/shared/crud.js` | 74 | `.get()` pada form pengeluaran |
| API `Map` native | `src/features/shared/EntityModal.jsx` | 16 | `.get()` saat memilih ID bahan |
| API `Map` native | `src/features/resep/Resep.jsx` | 10 | `.get()` menerjemahkan `idBahan` |

**Hasil:** **TERBUKTI** untuk struktur `Map`, key berupa ID bahan, dan pencarian `.get()`. `cariBahan()` dan `ubahStokBahan()` belum memiliki pemanggil; lihat Bagian 7.

---

### 4.3 Tree

**File:** `src/structures/tree.js`  
**Fungsi/kelas:** `NodeLaporan`, `bangunTreeLaporan`

Potongan kode langsung dari source:

```js
54: export class NodeLaporan{
59:   constructor(tingkat,label){this.tingkat=tingkat;this.label=label;this.income=0;this.expense=0;this.profit=0;this.anak=[]}
65:   tambahAnak(node){this.anak.push(node);return node}
66: }
73: export function bangunTreeLaporan(transaksi,pengeluaran){
74:   const akar=new NodeLaporan('root','Laporan')
76:   const dapatkan=(parent,tingkat,label)=>{let n=parent.anak.find(x=>x.label===label);return n||parent.tambahAnak(new NodeLaporan(tingkat,label))}
78:   const masukkan=(tanggal,jenis,nilai)=>{
79:    if(!tanggal)return
80:    const [tahun,bulan,hari]=tanggal.split('-')
81:    const t=dapatkan(akar,'tahun',tahun),b=dapatkan(t,'bulan',bulan),h=dapatkan(b,'hari',hari)
82:    h[jenis]+=nilai
83:   }
84:   transaksi.filter(x=>x.status==='Selesai').forEach(x=>masukkan(x.tanggal,'income',Number(x.total)||0))
85:   pengeluaran.forEach(x=>masukkan(x.tanggal,'expense',Number(x.total)||0))
86:   // Post-order: agregat anak ke parent, lalu hitung profit.
87:   const hitung=n=>{n.anak.forEach(hitung);if(n.anak.length){n.income=n.anak.reduce((s,x)=>s+x.income,0);n.expense=n.anak.reduce((s,x)=>s+x.expense,0)}n.profit=n.income-n.expense}
88:   hitung(akar);return akar
89: }
```

Potongan pemanggilan di `src/hooks/useDerivedData.js`:

```js
 4: import { bangunTreeLaporan } from '@/structures/tree'
12:  const laporan=useMemo(
13:   ()=>bangunTreeLaporan(laporanData?.transaksi||data.transaksi,laporanData?.pengeluaran||data.pengeluaran),
14:   [laporanData,data.transaksi,data.pengeluaran]
15:  )
```

Potongan rendering di `src/features/laporan/Laporan.jsx`:

```js
11:  const yearNodes=laporan.anak
```

Tiga substrak persis dari baris 14 (baris sumber sangat panjang):

```js
yearNodes.map(y=><details key={y.label} className="border-b border-line py-3">
y.anak.map(m=><details key={m.label}>
m.anak.map(d=><p key={d.label}>Tanggal {d.label}: Pendapatan {rupiah(d.income)} · Pengeluaran {rupiah(d.expense)} · Keuntungan {rupiah(d.profit)}</p>)
```
— `src/features/laporan/Laporan.jsx:14`

Potongan format data dari backend di `server/controllers/laporanController.js`:

```js
236:       // Format ini sesuai ekspektasi bangunTreeLaporan() di frontend.
237:       transaksi,
238:       pengeluaran,
```

**Cara kerja:** tree berakar dibentuk sebagai `root → tahun → bulan → hari` dari `tanggal.split('-')`. Hanya transaksi berstatus `Selesai` yang menyumbang `income`; seluruh pengeluaran menyumbang `expense`. Fungsi `hitung()` melakukan traversal post-order: anak diproses lebih dulu, lalu nilai `income`/`expense` dijumlahkan ke parent, dan `profit = income - expense` dihitung di setiap node.

**Lokasi pemanggilan:**

| File | Baris | Keterangan |
|---|---:|---|
| `src/hooks/useDerivedData.js` | 4, 12-15 | Membangun tree di dalam `useMemo` |
| `src/App.jsx` | 61 | Mengambil `laporan` dari `useDerivedData` |
| `src/App.jsx` | 104 | Menoper `laporan` ke komponen `Laporan` |
| `src/features/laporan/Laporan.jsx` | 11, 14 | Merender tahun → bulan → hari bertingkat |
| `server/controllers/laporanController.js` | 236-238 | Menyiapkan array transaksi/pengeluaran sesuai ekspektasi tree |

**Hasil:** **TERBUKTI** dan terintegrasi pada jalur yang terverifikasi secara statis dengan fitur Laporan Keuntungan.

---

### 4.4 Bubble Sort

**File:** `src/algorithms/bubbleSort.js`  
**Fungsi:** `bubbleSort(data, properti, arah = 'asc')`

Potongan kode langsung dari source:

```js
54: export function bubbleSort(data, properti, arah = 'asc') {
55:   const hasil = [...data], faktor = arah === 'desc' ? -1 : 1
56:   for (let i = 0; i < hasil.length - 1; i++) for (let j = 0; j < hasil.length - i - 1; j++) {
57:     const a = hasil[j][properti], b = hasil[j + 1][properti]
58:     const banding = typeof a === 'number' && typeof b === 'number'
59:       ? a - b
60:       : String(a ?? '').localeCompare(String(b ?? ''), 'id', { numeric: true })
61:     if (banding * faktor > 0) [hasil[j], hasil[j + 1]] = [hasil[j + 1], hasil[j]]
62:   }
63:   return hasil
64: }
```

Bukti sesuai persyaratan:

| Persyaratan | Bukti di kode |
|---|---|
| Perulangan | Baris 56: `for (let i...)` bersarang dengan `for (let j...)` |
| Perbandingan elemen bersebelahan | Baris 57: `hasil[j]` dibandingkan dengan `hasil[j + 1]` |
| Pertukaran posisi | Baris 61: destrukturing assignment `[hasil[j], hasil[j+1]] = [hasil[j+1], hasil[j]]` |
| Ascending | Baris 55: `faktor = 1` untuk `asc` (default) |
| Descending | Baris 55: `faktor = -1` untuk `desc` |

**Cara kerja:** data disalin dengan `[...data]` agar array asli tidak berubah. Setiap pass membandingkan pasangan elemen bersebelahan. Untuk angka, perbandingan memakai `a - b`; untuk teks memakai `localeCompare('id', { numeric: true })`, sehingga `BH-2` diurutkan sebelum `BH-10`. Elemen ditukar hanya bila `banding * faktor > 0`, sehingga nilai sama tidak ditukar (stabil). Implementasi tidak memakai flag `swapped`, sehingga tetap O(n²) pada kondisi terbaik sekalipun. Hasil hanya dipakai untuk urutan tampilan tabel.

**Lokasi pemanggilan di halaman admin:**

| File | Baris | Pemanggilan |
|---|---:|---|
| `src/features/bahan-baku/BahanBaku.jsx` | 4, 16 | `bubbleSort(cocok,'nama')` — ascending nama bahan |
| `src/features/pengeluaran/Pengeluaran.jsx` | 4, 13 | `bubbleSort(...,'tanggal','desc')` — pengeluaran terbaru |
| `src/features/transaksi/Transaksi.jsx` | 4, 14 | `bubbleSort(...,'tanggal',sortDir)` — arah dari tombol toggle |
| `src/features/transaksi/Transaksi.jsx` | 15 | Toggle `sortDir` antara `'asc'` dan `'desc'` |
| `src/features/resep/Resep.jsx` | 4, 10 | `bubbleSort(resep,'produk')` — ascending nama produk |

**Hasil:** **TERBUKTI** dan terintegrasi pada 4 tabel admin yang terverifikasi secara statis, termasuk dukungan ascending dan descending.

---

## 5. Indeks Ringkas File, Fungsi, dan Bukti Utama

| Konsep | File implementasi | Fungsi | Bukti utama |
|---|---|---|---|
| Array/List | `src/structures/arrayList.js` | `tambahItem`, `ubahItem`, `hapusItem`, `cariItem` | `src/features/shared/crud.js:33-39,143-158`; `src/features/shared/tableHelpers.jsx:6` (rincian di Bagian 4.1) |
| Hash Map | `src/structures/hashMap.js` | `buatHashMapBahan`, `cariBahan`, `ubahStokBahan` | Hanya `buatHashMapBahan()` yang dipanggil, di `src/hooks/useAppData.js:27`; API `Map` native dipakai di `src/constants/app.js:15`, `src/hooks/useDerivedData.js:9`, `src/features/shared/crud.js:74`, `src/features/shared/EntityModal.jsx:16`, `src/features/resep/Resep.jsx:10`; `cariBahan()`/`ubahStokBahan()` tanpa pemanggil (rincian di Bagian 4.2 dan 7) |
| Tree | `src/structures/tree.js` | `NodeLaporan`, `bangunTreeLaporan` | `src/hooks/useDerivedData.js:12-15` → `src/App.jsx:61,104` → `src/features/laporan/Laporan.jsx:11,14` (rincian di Bagian 4.3) |
| Bubble Sort | `src/algorithms/bubbleSort.js` | `bubbleSort` | `src/features/bahan-baku/BahanBaku.jsx:16`; `src/features/pengeluaran/Pengeluaran.jsx:13`; `src/features/transaksi/Transaksi.jsx:14-15`; `src/features/resep/Resep.jsx:10` (rincian di Bagian 4.4) |

Catatan: tabel ini hanya indeks. Kutipan kode dan daftar lokasi lengkap ada di Bagian 4.

---

## 6. Hasil Integrasi Setiap Konsep dengan Fitur Aplikasi

| Konsep | Fitur aplikasi | Status integrasi (berdasarkan bukti statis) |
|---|---|---|
| Array/List | Tambah/edit/hapus transaksi, pengeluaran, bahan, resep, produksi | Terintegrasi pada jalur yang terverifikasi secara statis |
| Hash Map | Form pengeluaran, dropdown bahan, tabel resep | Lookup `.get()` terintegrasi secara statis; `ubahStokBahan()` lolos pengujian unit tetapi **belum terintegrasi** pada alur produksi utama |
| Tree | Laporan Keuntungan | Terintegrasi pada jalur yang terverifikasi secara statis |
| Bubble Sort | Tabel Bahan Baku, Pengeluaran, Transaksi, Resep | Terintegrasi pada jalur yang terverifikasi secara statis, termasuk toggle asc/desc pada Transaksi |

Catatan: backend tetap menjadi sumber kebenaran data. Operasi array/list di frontend hanya merakit payload dan daftar kerja; penulisan data terjadi melalui API/MySQL. Verifikasi statis dan pengujian unit in-memory **bukan pengganti pengujian runtime/UI**.

---

## 7. Temuan Khusus Hash Map

Pemeriksaan menemukan hal berikut:

1. **Pencarian bahan dengan `Map` terbukti.**  
   `buatHashMapBahan()` dipanggil di `src/hooks/useAppData.js:27` dengan key `b.id`. Pemanggilan `.get()` ditemukan di:
   - `src/features/shared/crud.js:74`
   - `src/features/shared/EntityModal.jsx:16`
   - `src/features/resep/Resep.jsx:10`

2. **`cariBahan()` tidak memiliki pemanggil.**  
   Fungsi ini hanya didefinisikan di `src/structures/hashMap.js:68`. Pencarian di seluruh `src/` dan `server/` tidak menemukan pemanggilan `cariBahan(...)`. UI memanggil `.get()` langsung pada objek `Map`.

3. **`ubahStokBahan()` tidak memiliki pemanggil.**  
   Fungsi ini hanya didefinisikan di `src/structures/hashMap.js:78-82`. Tidak ada file lain yang meng-import atau memanggilnya. Pengujian unit terhadap fungsi ini lulus (stok berkurang menjadi `7`, stok negatif dan id tidak ada ditolak). Pengujian terbaru di Bagian 3A juga menguji fungsi ini bersama `buatHashMapBahan()` dan `cariBahan()` dalam 20 test Hash Map dan tetap lolos. Namun fungsi ini **belum terintegrasi pada alur produksi utama**; integrasinya ke alur aplikasi tidak terbukti.

4. **Proses produksi memperbarui stok melalui backend MySQL.**  
   Bukti langsung dari `server/controllers/produksiController.js`:

   ```js
 102: async function terapkanStok(koneksi, pemakaian, arah) {
 103:   // Hash Map: gabungkan bahan yang muncul lebih dari sekali.
 104:   const ringkas = new Map();
 105:   for (const item of pemakaian) {
 108:     ringkas.set(item.idBahan, (ringkas.get(item.idBahan) || 0) + Number(item.jumlah || 0));
 109:   }
 112:   const daftar = [...ringkas.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
 124:     const stokBaru = Number(bahan[0].stok) + arah * jumlah;
 125:     if (arah < 0 && stokBaru < 0) {
 126:       throw badRequest(`Stok ${bahan[0].nama_bahan} tidak mencukupi untuk produksi ini.`);
 127:     }
 129:     await koneksi.query(
 130:       'UPDATE bahan_baku SET stok = ? WHERE id_bahan = ?',
 131:       [stokBaru, idBahan]
 132:     );
 133:   }
 134: }
   ```

   Kode ini memakai `Map` native untuk menggabungkan pemakaian bahan yang berulang, lalu melakukan `UPDATE` ke tabel `bahan_baku` di dalam transaksi database. Ini **bukan** pemanggilan terhadap `ubahStokBahan()` dari `src/structures/hashMap.js`.

**Kesimpulan temuan:** pernyataan bahwa “fungsi pembaruan stok Hash Map digunakan dalam proses produksi” **tidak sesuai dengan source code**. Yang benar: lookup berbasis `Map` digunakan di frontend, sedangkan pembaruan stok produksi dilakukan oleh backend MySQL.

---

## 8. Kesimpulan dan Keterbatasan Pemeriksaan

### Kesimpulan

Keempat konsep yang diperiksa **benar-benar diimplementasikan** dalam source code Brookies:

- **Array/List** — TERBUKTI, terintegrasi pada jalur CRUD frontend yang terverifikasi secara statis.
- **Tree** — TERBUKTI, terintegrasi pada Laporan Keuntungan yang terverifikasi secara statis.
- **Bubble Sort** — TERBUKTI, terintegrasi pada empat tabel admin yang terverifikasi secara statis dengan dukungan ascending/descending.
- **Hash Map** — TERBUKTI sebagai `Map` native dengan key ID bahan dan lookup `.get()`; `ubahStokBahan()` lolos pengujian unit, tetapi **belum terintegrasi pada alur produksi utama** karena tidak ada pemanggil dan stok produksi diperbarui di backend MySQL.

Secara keseluruhan, tiga konsep terbukti dan terintegrasi pada jalur yang terverifikasi secara statis; satu konsep (Hash Map) terbukti sebagian dengan catatan penting seperti pada Bagian 7. Verifikasi statis dan pengujian unit in-memory tidak menggantikan pengujian runtime/UI. Pengujian otomatis terbaru (Bagian 3A) memperkuat pembuktian modul dengan **71/71 test lulus**, tetapi tidak mengubah status integrasi Hash Map di atas.

### Keterbatasan

1. Pengujian bersifat **in-memory** dan menguji logika modul secara unit; tidak menjalankan aplikasi React penuh atau interaksi browser.
2. Tidak ada pengujian terhadap database produksi, sesuai ketentuan audit. Integrasi backend diverifikasi secara statis dari source code.
3. `ubahStokBahan()` diuji sebagai unit, tetapi tidak dapat dibuktikan terintegrasi karena tidak ada pemanggil di source code.
4. Nomor baris merujuk pada source code pada commit `9adeb541120ef7088ae9172869591d80c8513390`. Baris dapat bergeser jika file diubah kemudian.
5. Laporan ini tidak mencakup penilaian performa runtime, keamanan aplikasi secara menyeluruh, atau pengujian end-to-end terhadap hosting.
6. Bukti tertulis untuk 28 pemeriksaan hanya berupa ringkasan (`total`, `passed`, `failed`, rincian per kategori, dan contoh hasil); daftar nama per pemeriksaan tidak tersedia, sehingga tidak dicantumkan.
7. Pengujian 71 test terbaru memiliki output yang dapat dijalankan ulang, tetapi tetap merupakan unit testing modul. Pengujian ini tidak mencakup interaksi UI, request API, atau transaksi database, dan tidak mengubah status integrasi `ubahStokBahan()`.

---

**Dokumen ini dibuat sebagai bukti akademik berdasarkan hasil audit read-only. Pembaruan berikutnya menambahkan empat file test dan Bagian 3A; tidak ada source code, database, konfigurasi, atau dokumen lain yang diubah dalam proses pembaruan ini.**
