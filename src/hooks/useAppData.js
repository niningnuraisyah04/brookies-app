// PENGAMBIL DATA APLIKASI — dipindahkan dari App.jsx (Tahap 8).
// Urutan request, payload, perhitungan Hash Map, dan pesan error tidak diubah.
import { useState } from 'react'
import api from '@/services/api'
import { buatHashMapBahan } from '@/structures/hashMap'
import { dataAwal, TAHUN_SEKARANG } from '@/constants/app'

export function useAppData({ setPesan }) {
 const [data,setData]=useState(dataAwal)
 const [ringkasan,setRingkasan]=useState(null)
 const [laporanData,setLaporanData]=useState(null)
 const [loadingData,setLoadingData]=useState(false)
 const [tahunLaporan,setTahunLaporan]=useState(TAHUN_SEKARANG)

 // Dipanggil setelah login dan setelah setiap perubahan data agar
 // tampilan selalu mengikuti database (bukan localStorage).
 async function muatSemuaData(tahun=tahunLaporan){
  setLoadingData(true)
  try{
   const [bahan,resep,transaksi,pengeluaran,produksi,dashboard,laporan]=await Promise.all([
    api.daftarBahan(),api.daftarResep(),api.daftarTransaksi(),
    api.daftarPengeluaran(),api.daftarProduksi(),
    api.dashboard(tahun),api.laporan(tahun)
   ])

   // Bahan tetap memakai Hash Map agar pencarian berdasarkan ID cepat.
   const bahanMap=buatHashMapBahan(bahan.data.map(b=>({
    id:b.id,nama:b.nama,stok:Number(b.stok),satuan:b.satuan,
    minimum:Number(b.minimum),kebutuhanBulanan:Number(b.kebutuhanBulanan),
    hargaBahan:Number(b.hargaBahan)
   })))

   setData({
    transaksi:transaksi.data,
    pengeluaran:pengeluaran.data,
    produksi:produksi.data,
    resep:resep.data.map(r=>({
     id:r.id_resep,produk:r.produk,idBahan:r.id_bahan,
     jumlah:Number(r.jumlah),satuan:r.satuan,hasilPerBatch:Number(r.hasil_per_batch)
    })),
    dataBahan:bahanMap
   })
   setRingkasan(dashboard.data)
   setLaporanData(laporan.data)
  }catch(err){
   setPesan(err.message,'gagal')
  }finally{
   setLoadingData(false)
  }
 }

 // Ganti tahun laporan: tree dan statistik diambil dari satu response yang sama.
 async function gantiTahun(tahun){
  setTahunLaporan(tahun)
  try{
   const [dashboard,laporan]=await Promise.all([api.dashboard(tahun),api.laporan(tahun)])
   setRingkasan(dashboard.data)
   setLaporanData(laporan.data)
  }catch(err){setPesan(err.message,'gagal')}
 }

 function resetData(){
  setData(dataAwal())
  setRingkasan(null)
  setLaporanData(null)
 }

 return {
  data, ringkasan, laporanData, loadingData, tahunLaporan,
  muatSemuaData, gantiTahun, resetData
 }
}
