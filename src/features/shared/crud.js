// CRUD BERSAMA — dipindahkan dari App.jsx (Tahap 6).
// Logika, validasi, pesan, dan urutan proses tidak diubah; hanya ditempatkan dalam hook.
import { useRef, useState } from 'react'
import api from '@/services/api'
import { dataMenu } from '@/data/master'
import { tambahItem, ubahItem, hapusItem, cariItem } from '@/structures/arrayList'
import { saluran, kategoriPengeluaran, status } from '@/constants/app'

export const today=()=>new Date().toISOString().slice(0,10)
// ID bahan baru memakai format BH-001 (maksimal 10 karakter).
// Nomor dimulai dari suffix terbesar yang dipakai agar tidak tabrakan dengan data existing.
function idBahanBerikutnya(daftar){
 const dipakai=new Set(daftar.map(b=>String(b.id||'')))
 const nomorAda=daftar.map(b=>Number(String(b.id||'').match(/^BH-(\d+)$/)?.[1])).filter(Number.isFinite)
 let nomor=nomorAda.length?Math.max(...nomorAda)+1:1
 let id=`BH-${String(nomor).padStart(3,'0')}`
 while(dipakai.has(id)){nomor+=1;id=`BH-${String(nomor).padStart(3,'0')}`}
 return id
}

export function useCrud({ data, allBahan, setPesan, muatSemuaData }) {
 const [modal,setModal]=useState(null)
 const [editing,setEditing]=useState(null)
 const [form,setForm]=useState({})
 const [saving,setSaving]=useState(false)
 const savingRef=useRef(false)

 // ARRAY/LIST: daftar kerja entitas. Array native tetap dipakai untuk tampilan;
 // operasi Array/List dipakai pada jalur pengelolaan data (tambah/ubah/hapus/cari).
 const daftarEntitas=(kind)=>kind==='bahan'?allBahan:(data[kind]||[])
 // Susun payload lewat operasi Array/List: tambah untuk entitas baru,
 // ubah untuk entitas yang disunting, lalu cari untuk membaca hasilnya kembali.
 const susunItem=(kind,perubahan)=>{
  const daftar=daftarEntitas(kind)
  const id=perubahan.id
  return editing
   ? (cariItem(ubahItem(daftar,editing,perubahan),editing)||{...perubahan})
   : (cariItem(tambahItem(daftar,{id,...perubahan}),id)||{...perubahan})
 }

 const startAdd=(kind)=>{if(savingRef.current)return;setEditing(null);setForm(formDefaults(kind));setModal(kind)}
 // Produksi lama (Opsi E.2) tidak punya snapshot; jangan jalankan penyesuaian stok otomatis.
 const produksiTanpaSnapshot=(item)=>item&&item.sumberSnapshot==='rekonstruksi'
 const pesanTanpaSnapshot=()=>setPesan('Catatan produksi lama belum memiliki snapshot historis. Penyesuaian stok otomatis tidak tersedia dan memerlukan konfirmasi manual.','gagal')
 const startEdit=(kind,item)=>{
  if(savingRef.current)return
  if(kind==='produksi'&&produksiTanpaSnapshot(item)){pesanTanpaSnapshot();return}
  setEditing(item.id);setForm({...item});setModal(kind)
 }
 const closeModal=()=>{if(savingRef.current)return;setModal(null);setEditing(null)}
 async function saveEntity(kind,e){
  e.preventDefault()
  // Guard synchronous: klik Simpan berulang tidak membuat request ganda.
  if(savingRef.current)return
  savingRef.current=true
  setSaving(true)
  let pesanSukses='Data berhasil disimpan.'
  let berhasil=false
  try{

   if(kind==='transaksi'){
    // Total dihitung ulang dari menu agar tidak bergantung pada angka form.
    const menu=dataMenu.find(x=>x.nama===form.produk)
    if(!menu)throw new Error('Produk tidak ditemukan.')
    const item=susunItem(kind,{
     id:editing||form.id,tanggal:form.tanggal,saluran:form.saluran,
     produk:form.produk,jumlahProduk:Number(form.jumlahProduk),
     total:menu.harga*Number(form.jumlahProduk),status:form.status
    })
    const hasil=await api.simpanTransaksi(editing,item)
    pesanSukses=hasil.message||pesanSukses

   }else if(kind==='pengeluaran'){
    const bahan=form.kategori===kategoriPengeluaran[0]?data.dataBahan.get(form.idBahan):null
    const jumlahBeli=Number(form.jumlahBeli||0)
    // Harga satuan bahan dihitung dari harga bulanan ÷ kebutuhan bulanan.
    const hargaSatuan=bahan&&Number(bahan.kebutuhanBulanan)>0
     ?Number(bahan.hargaBahan||0)/Number(bahan.kebutuhanBulanan):0
    // Validasi frontend disamakan dengan server/routes/pengeluaran.js.
    if(!form.tanggal)throw new Error('Tanggal pengeluaran wajib diisi.')
    if(form.kategori===kategoriPengeluaran[0]){
     if(!form.idBahan)throw new Error('Bahan baku wajib dipilih.')
     if(!(jumlahBeli>0))throw new Error('Jumlah beli harus lebih dari 0.')
     if(!(hargaSatuan>0))throw new Error('Harga satuan harus lebih dari 0. Periksa harga dan kebutuhan bulanan bahan.')
    }else if(!(Number(form.total)>0))throw new Error('Total pengeluaran operasional harus lebih dari 0.')
    const item=susunItem(kind,{
     id:editing||form.id,tanggal:form.tanggal,kategori:form.kategori,
     nama:form.kategori===kategoriPengeluaran[0]?(bahan?.nama||form.nama):form.nama,
     total:form.kategori===kategoriPengeluaran[0]?Math.round(jumlahBeli*hargaSatuan):Number(form.total),
     idBahan:form.kategori===kategoriPengeluaran[0]?form.idBahan:null,
     jumlahBeli:form.kategori===kategoriPengeluaran[0]?jumlahBeli:null,
     satuan:form.kategori===kategoriPengeluaran[0]?(bahan?.satuan||form.satuan):null,
     hargaSatuan:form.kategori===kategoriPengeluaran[0]?hargaSatuan:null
    })
    // Stok tidak diubah di browser; backend yang memperbarui MySQL.
    const hasil=await api.simpanPengeluaran(editing,item)
    pesanSukses=hasil.message||pesanSukses

   }else if(kind==='bahan'){
    const id=editing||form.id
    if(!id||!form.nama||!form.satuan)throw new Error('ID, nama, dan satuan bahan wajib diisi.')
    const item=susunItem(kind,{
     id,nama:form.nama.trim(),stok:Number(form.stok||0),satuan:form.satuan,
     minimum:Number(form.minimum||0),kebutuhanBulanan:Number(form.kebutuhanBulanan||0),
     hargaBahan:Number(form.hargaBahan||0)
    })
    const hasil=await api.simpanBahan(editing,item)
    pesanSukses=hasil.message||pesanSukses

   }else if(kind==='resep'){
    const item=susunItem(kind,{
     id:editing||form.id,produk:form.produk,id_bahan:form.idBahan,
     jumlah:Number(form.jumlah),satuan:form.satuan,
     hasil_per_batch:Number(form.hasilPerBatch)
    })
    const hasil=await api.simpanResep(editing,item)
    pesanSukses=hasil.message||pesanSukses

   }else if(kind==='produksi'){
    // Backend yang membaca resep, mengecek stok, dan menghitung jumlah hasil.
    const item=susunItem(kind,{
     id:editing||form.id,tanggal:form.tanggal,produk:form.produk,
     jumlahBatch:Number(form.jumlahBatch)
    })
    const hasil=await api.simpanProduksi(editing,item)
    pesanSukses=hasil.message||pesanSukses
   }

   berhasil=true
  }catch(err){setPesan(err.message,'gagal')}
  finally{savingRef.current=false;setSaving(false)}

  // Modal hanya ditutup dan data dimuat ulang setelah simpan berhasil.
  if(berhasil){
   closeModal()
   setPesan(pesanSukses)
   await muatSemuaData()
  }
 }
 // Menentukan nilai awal setiap form berdasarkan jenis data yang akan ditambahkan.
 function formDefaults(kind){if(kind==='transaksi')return{id:`TR-${Date.now()}`,tanggal:today(),saluran:saluran[0],produk:dataMenu[0].nama,jumlahProduk:1,status:status[0]};if(kind==='pengeluaran')return{id:`PG-${Date.now()}`,tanggal:today(),kategori:kategoriPengeluaran[1],nama:'',total:0,idBahan:'',jumlahBeli:1,satuan:''};if(kind==='bahan')return{id:idBahanBerikutnya(allBahan),nama:'',stok:0,satuan:'gram',minimum:0,kebutuhanBulanan:0,jumlahBeli:0,hargaBahan:0};if(kind==='resep')return{id:`RSP-${Date.now()}`,produk:dataMenu[0].nama,idBahan:allBahan[0]?.id||'',jumlah:0,satuan:'gram',hasilPerBatch:10};return{id:`PR-${Date.now()}`,tanggal:today(),produk:dataMenu[0].nama,jumlahBatch:1}}
 // ARRAY/LIST: cari entitas untuk guard, hapus dari daftar kerja setelah sukses, lalu verifikasi.
 async function delEntity(key,id){
  const daftar=daftarEntitas(key)
  const item=cariItem(daftar,id)
  if(key==='produksi'&&produksiTanpaSnapshot(item)){pesanTanpaSnapshot();return}
  if(!confirm('Hapus data ini?'))return
  try{
   // Pemetaan jenis data ke fungsi API penghapus yang sesuai.
   const aksi={
    bahan:api.hapusBahan,resep:api.hapusResep,transaksi:api.hapusTransaksi,
    pengeluaran:api.hapusPengeluaran,produksi:api.hapusProduksi
   }[key]
   if(!aksi)throw new Error('Jenis data tidak dikenali.')

   const hasil=await aksi(id)
   const sisa=hapusItem(daftar,id)
   if(cariItem(sisa,id))throw new Error('Gagal memperbarui daftar data.')
   setPesan(hasil.message||'Data berhasil dihapus.')
   await muatSemuaData()
  }catch(err){setPesan(err.message,'gagal')}
 }

 return {modal,editing,form,setForm,startAdd,startEdit,closeModal,saveEntity,delEntity,saving}
}
