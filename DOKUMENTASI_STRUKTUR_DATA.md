# Panduan Implementasi Struktur Data — Website Manajemen Usaha Brookies

Dokumen ini menjelaskan **apa yang benar-benar ada di kode**, bukan teori umum.
Seluruh contoh merujuk pada file di folder `src/` dan `server/`.
Dibuat pada Tahap 15B (penataan source code & dokumentasi).

---

## Ringkasan Peta Modul

| Struktur / Algoritma | File implementasi | Pemanggil langsung | Fungsi dalam aplikasi |
| --- | --- | --- | --- |
| Array / List | `src/structures/arrayList.js` | `src/features/shared/crud.js` | Menyusun payload & memvalidasi daftar kerja CRUD |
| Hash Map | `src/structures/hashMap.js` + `Map` native | `src/hooks/useAppData.js` (pembuatan) | Lookup bahan baku berdasarkan ID |
| Tree | `src/structures/tree.js` | `src/hooks/useDerivedData.js` | Laporan hierarkis Tahun → Bulan → Hari |
| Bubble Sort | `src/algorithms/bubbleSort.js` | 4 komponen tabel | Mengurutkan baris tabel sebelum ditampilkan |

Sumber data permanen adalah **MySQL melalui API**. Keempat struktur di atas
hanya berupa *kumpulan data kerja di browser* dan tidak menggantikan database.

---

## A. Array / List

### 1. Pengertian dan tujuan

`src/structures/arrayList.js` berisi empat operasi untuk **Array native
JavaScript**. Tidak ada class khusus dan tidak ada state internal. Tujuannya
adalah memakai satu pola yang konsisten untuk manipulasi daftar entitas
sebelum data dikirim ke API.

### 2. Data yang disimpan

Array of object. Setiap objek memiliki properti `id` yang dipakai sebagai
penanda. Contoh: transaksi, pengeluaran, bahan baku, resep, dan produksi.

### 3. Operasi dan cara kerja

| Fungsi | Cara kerja | Mengembalikan |
| --- | --- | --- |
| `tambahItem(list, item)` | `[...list, item]` — item ditaruh di akhir | Array baru |
| `ubahItem(list, id, perubahan)` | `map`; jika `x.id === id`, dikembalikan `{...x, ...perubahan}` | Array baru |
| `hapusItem(list, id)` | `filter(x => x.id !== id)` — menghapus **semua** yang cocok | Array baru |
| `cariItem(list, id)` | `find(x => x.id === id)` — berhenti di item pertama | Objek atau `undefined` |

Perbandingan id memakai `===` (strict). Semua fungsi bersifat **immutable**
kecuali bukan mutasi array asal, sehingga aman untuk state React.

### 4. Lokasi pemanggilan

Satu-satunya file pemanggil: **`src/features/shared/crud.js`**.

- Baris 6: import keempat fungsi.
- Baris 30 `daftarEntitas(kind)`: memilih array sumber (`allBahan` untuk bahan,
  `data[kind]` untuk entitas lain).
- Baris 33–39 `susunItem(kind, perubahan)`:
  - mode edit → `ubahItem(...)` lalu `cariItem(...)`;
  - mode tambah → `tambahItem(...)` lalu `cariItem(...)`;
  - fallback `{...perubahan}` bila hasil baca tidak ditemukan.
- `susunItem` dipanggil untuk lima proses CRUD: transaksi (baris 65),
  pengeluaran (86), bahan (102), resep (111), produksi (121). Hasilnya
  diteruskan ke `api.simpan*` pada baris 70, 96, 107, 116, 125.
- Baris 143–162 `delEntity(key, id)`: `cariItem` sebagai guard produksi tanpa
  snapshot (145), `hapusItem` setelah API hapus berhasil (157), lalu
  `cariItem` lagi untuk memastikan id benar-benar hilang (158).

Tombol Edit/Hapus yang memicu fungsi ini berada di
`src/features/shared/tableHelpers.jsx` baris 6 dan diteruskan dari `App.jsx`.

### 5. Peran dalam CRUD Brookies

Array/List membantu proses CRUD dengan cara:

1. **Create** — menyusun objek baru lengkap dengan id sebelum POST.
2. **Read** — membaca kembali hasil susunan untuk dipakai sebagai payload.
3. **Update** — menimpa properti entitas yang sedang diedit tanpa mengubah
   elemen lain.
4. **Delete** — menghapus entitas pada daftar kerja lokal dan memverifikasi
   hasilnya.

Data hasil operasi ini **hanya sementara**. Setelah mutasi berhasil,
`muatSemuaData()` dipanggil lagi agar tampilan mengikuti database.

### 6. Kompleksitas (implementasi aktual)

`tambahItem` O(n) karena menyalin array; `ubahItem` dan `hapusItem` O(n);
`cariItem` O(n) worst case (pencarian linear dengan `find`).

---

## B. Hash Map

### 1. Klarifikasi implementasi

Pernyataan paling akurat: **modul `src/structures/hashMap.js` memang buatan
sendiri, tetapi struktur penyimpanannya adalah `Map` native JavaScript**.
Tidak ada fungsi hash, bucket, penanganan kolisi, atau resizing yang ditulis
manual. Jadi istilah "Hash Map" di sini merujuk pada perilaku `Map` native,
bukan implementasi hash table dari nol.

### 2. Tujuan, key, dan value

- **Tujuan:** mempercepat pencarian bahan baku berdasarkan ID.
- **Key:** `b.id`, string seperti `BH-001`.
- **Value:** salinan dangkal objek bahan:
  `{ id, nama, stok, satuan, minimum, kebutuhanBulanan, hargaBahan }`.
  Bentuk ini ditentukan di `src/hooks/useAppData.js` baris 27–31.

### 3. Cara data dimasukkan dan dicari

| Fungsi | Cara kerja |
| --- | --- |
| `buatHashMapBahan(daftar)` | `new Map(daftar.map(b => [b.id, {...b}]))`. Id sama menimpa value lama. |
| `cariBahan(map, id)` | `map.get(id)` → value atau `undefined`. |
| `ubahStokBahan(map, id, delta)` | `get`, cek ada, `stok + delta`, cek tidak negatif, `set`, kembalikan value terbaru. Map dimutasi di tempat. |

### 4. Lokasi implementasi dan pemanggilan

**Aktif dipakai:**

- `src/hooks/useAppData.js:27` — `buatHashMapBahan(...)` setelah tujuh endpoint
  API selesai dimuat; hasilnya disimpan sebagai `data.dataBahan` (baris 41).
- `src/hooks/useDerivedData.js:9` — `[...data.dataBahan.entries()]` diubah
  menjadi array `allBahan` untuk tabel dan dropdown.
- `src/features/shared/crud.js:74` — `data.dataBahan.get(form.idBahan)` saat
  menghitung harga satuan pengeluaran kategori Bahan Baku.
- `src/features/shared/EntityModal.jsx:16` — `.get()` pada form pengeluaran.
- `src/features/resep/Resep.jsx:10` — `.get(x.idBahan)?.nama` untuk menampilkan
  nama bahan pada tabel resep.
- `src/constants/app.js:15` — `new Map()` kosong sebagai nilai awal.

**Tersedia tetapi belum dipanggil komponen mana pun:**

- `cariBahan()` dan `ubahStokBahan()` hanya berupa definisi di `hashMap.js`.
  Sinkronisasi stok yang sebenarnya terjadi di backend MySQL
  (`pengeluaranController.js`, `produksiController.js`), bukan di browser.

**`Map` native lain di backend (bukan modul `hashMap.js`):**

- `server/controllers/laporanController.js:82–93` — `petaPendapatan` dan
  `petaPengeluaran`, key = nomor bulan 1–12, dipakai `.get(bulan)` untuk
  mengisi 12 titik grafik dashboard.
- `server/controllers/produksiController.js:104–114` — `ringkas`, key =
  `idBahan`, value = akumulasi jumlah sebelum `SELECT ... FOR UPDATE`.

### 5. Keuntungan di konteks Brookies

Pada tabel resep dengan banyak baris, setiap baris perlu menerjemahkan
`idBahan` menjadi nama dan satuan. Dengan Map, cukup `get(id)` sekali
(**O(1) rata-rata**). Jika memakai `array.find`, setiap baris memindai
puluhan bahan (**O(n)**). Id juga bertindak seperti primary key, sehingga
duplikat tidak mungkin tersimpan dua kali.

---

## C. Tree

### 1. Jenis tree berdasarkan kode

`src/structures/tree.js` adalah **implementasi khusus buatan sendiri**.
Jenisnya: **tree berakar, tidak biner (general / n-ary tree)**, karena setiap
node menyimpan array `anak` dengan jumlah bebas. Hierarkinya tetap:

```
root "Laporan"
└── tahun (mis. "2026")
    └── bulan (mis. "01")
        └── hari (mis. "15")
```

### 2. Struktur node dan relasi

Class `NodeLaporan` memiliki: `tingkat` (`root`/`tahun`/`bulan`/`hari`),
`label`, `income`, `expense`, `profit`, dan `anak` (array).
` tambahAnak(node)` menambah child dan mengembalikannya.

Relasi hanya **parent → child** melalui `anak`. Tidak ada pointer `parent`,
tidak ada method `hapusAnak` atau `cariAnak` publik.

### 3. Proses pembentukan

1. Buat `akar = new NodeLaporan('root', 'Laporan')`.
2. `tanggal.split('-')` menghasilkan `tahun`, `bulan`, `hari`.
3. `dapatkan(parent, tingkat, label)` mencari child dengan `label` sama;
   bila tidak ada, node baru dibuat lewat `tambahAnak`.
4. Transaksi berstatus `'Selesai'` ditambahkan sebagai `income`;
   pengeluaran ditambahkan sebagai `expense` (semua status).
5. Tanggal kosong diabaikan; `Number(x.total) || 0` mengamankan nilai.

### 4. Traversal / pencarian

- Pencarian node: `dapatkan()`, linear pada `parent.anak`, hanya
  membandingkan `label`.
- Traversal: `hitung()` **rekursif post-order** — anak diproses lebih
  dulu, lalu `income`/`expense` dijumlahkan ke parent, kemudian
  `profit = income - expense`.
- Tidak ada BFS/DFS generik atau `cariNode` yang diekspor.

### 5. Tujuan dan bagian yang memanfaatkan

- `src/hooks/useDerivedData.js:12–15` adalah **satu-satunya pemanggil**,
  dibungkus `useMemo`.
- `src/App.jsx:61` mengambil hasil `laporan`, lalu meneruskannya ke
  `src/features/laporan/Laporan.jsx` (baris 103–104).
- `Laporan.jsx:11` mengambil `laporan.anak` sebagai node tahun, lalu
  merender tiga level bersarang dengan `<details>` pada baris 14.
- `server/controllers/laporanController.js:236` hanya menyiapkan array
  dengan format yang diharapkan `bangunTreeLaporan()`; server tidak
  membangun tree.

---

## D. Bubble Sort

### 1. Tujuan dan data yang diurutkan

`src/algorithms/bubbleSort.js` mengurutkan array of object berdasarkan satu
properti. Dipakai untuk tabel transaksi, pengeluaran, bahan baku, dan resep.

### 2. Cara kerja

1. Salin data: `const hasil = [...data]` (array asli tidak dimutasi).
2. Arah: `faktor = -1` hanya untuk `'desc'`, selain itu `+1`.
3. Dua loop bersarang; setiap pass membandingkan pasangan bersebelahan.
4. Perbandingan:
   - dua nilai `number` → `a - b`;
   - selain itu → `localeCompare(..., 'id', { numeric: true })`, sehingga
     "BH-2" diurutkan sebelum "BH-10".
5. Pertukaran bila `banding * faktor > 0`; nilai sama tidak ditukar
   (sort stabil).

### 3. Kondisi berhenti dan kompleksitas

Loop berhenti setelah `n-1` pass dengan jendela `j < hasil.length - i - 1`.
**Tidak ada flag `swapped` / early exit.** Jadi:

| Kasus | Waktu | Keterangan |
| --- | --- | --- |
| Best (sudah terurut) | O(n²) | Perbandingan tetap penuh |
| Average | O(n²) | n(n−1)/2 perbandingan |
| Worst | O(n²) | Pass penuh + pertukaran setiap pasangan |
| Ruang | O(n) | Salinan array |

### 4. File yang mengimplementasikan dan memanggil

| File | Pemakaian hasil |
| --- | --- |
| `src/features/bahan-baku/BahanBaku.jsx:16` | Urut `nama` → tabel Daftar Bahan Baku |
| `src/features/pengeluaran/Pengeluaran.jsx:13` | Urut `tanggal` desc → tabel Pengeluaran |
| `src/features/transaksi/Transaksi.jsx:14` | Urut `tanggal` sesuai `sortDir` → tabel Transaksi |
| `src/features/resep/Resep.jsx:10` | Urut `produk` → tabel Daftar Resep |

Hasil sorting hanya mengatur urutan baris tabel, tidak pernah ditulis
kembali ke state permanen maupun API.

---

## Struktur Data Lain yang Terlihat di Kode (di luar tugas)

- `Set` native: `crud.js:13` (cek tabrakan id `BH-###`),
  `useDerivedData.js:23` (menghapus tahun duplikat),
  `produksiController.js:63` (mengumpulkan id bahan unik).
- `Map` native di backend: `laporanController.js:82–93`,
  `produksiController.js:104–114` (rincian di bagian B).
- Lookup berupa objek literal: `src/data/master.js` (`hargaBahanObj`,
  `resepObj`). `dataBahanAwal` dan `dataResepAwal` di file yang sama saat ini
  tidak diimpor komponen mana pun; yang dipakai hanya `dataMenu`.
- **Tidak ada** implementasi stack, queue, graph, linked list, heap, atau
  trie di `src/` maupun `server/`. Rekursi aktual ada pada
  `src/structures/tree.js:87-88`: `hitung()` memanggil dirinya sendiri lewat
  `n.anak.forEach(hitung)`, lalu dijalankan sebagai `hitung(akar)`. Baris 21
  hanya komentar tentang relasi parent → child, bukan rekursi.

---

## Panduan Memahami Struktur Data pada Website Manajemen Usaha Brookies

Urutan membaca yang disarankan untuk menjelaskan ke dosen:

1. **Buka `src/structures/arrayList.js` terlebih dahulu.**
   Ini yang paling sederhana: empat baris operasi Array yang dipakai langsung
   oleh proses CRUD. Lanjutkan ke `src/features/shared/crud.js:33-39` untuk
   melihat `susunItem()` (baris 28–32 adalah komentar Array/List), dan
   `src/features/shared/crud.js:142-162` untuk `delEntity()` pada
   Create/Update/Delete.

2. **Kedua, buka `src/structures/hashMap.js`.**
   Perhatikan bahwa ini pembungkus `Map` native, bukan hash table buatan
   sendiri. Lanjutkan ke `src/hooks/useAppData.js` baris 26–41 untuk melihat
   pembentukan `dataBahan`, lalu `src/hooks/useDerivedData.js` baris 9 dan
   `src/features/resep/Resep.jsx` baris 10 untuk melihat hasilnya.

3. **Ketiga, buka `src/structures/tree.js`.**
   Mulai dari class `NodeLaporan`, lalu `bangunTreeLaporan`. Perhatikan
   `dapatkan()` (pencarian child) dan `hitung()` (traversal post-order).
   Lanjutkan ke `src/hooks/useDerivedData.js` baris 12–15 dan
   `src/features/laporan/Laporan.jsx` baris 10–14 untuk melihat tampilannya.

4. **Keempat, buka `src/algorithms/bubbleSort.js`.**
   Baca komentar kondisi berhenti dan kompleksitas, lalu bandingkan dengan
   empat pemanggilnya (`BahanBaku.jsx`, `Pengeluaran.jsx`, `Transaksi.jsx`,
   `Resep.jsx`) untuk melihat bahwa hasilnya hanya mengurutkan tabel.

5. **Terakhir, buka dokumen ini dan `DOKUMENTASI_PERUBAHAN.md`**
   untuk melihat hubungan keseluruhan dengan API dan database.

Poin yang perlu ditekankan saat presentasi:
- Sumber data tetap **MySQL**; struktur data di browser hanya membantu
  pengolahan dan tampilan.
- Hash Map memakai `Map` native — jangan mengklaim ada fungsi hash manual.
- Tree yang dipakai **bukan binary tree**, melainkan n-ary tree.
- Bubble Sort yang dipakai **belum dioptimasi** (tanpa early exit),
  sehingga best case tetap O(n²).
