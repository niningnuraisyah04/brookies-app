// DATA TURUNAN — dipindahkan dari App.jsx (Tahap 8).
// Array/List dari Hash Map, Tree laporan, dan daftar tahun tetap memakai logika asli.
import { useMemo } from 'react'
import { bangunTreeLaporan } from '@/structures/tree'
import { TAHUN_SEKARANG } from '@/constants/app'

export function useDerivedData({ data, laporanData }) {
 // Mengubah isi Hash Map menjadi array agar mudah dipakai untuk proses tampilan/tabel.
 const allBahan=useMemo(()=>[...data.dataBahan.entries()].map(([id,b])=>({id,...b})),[data.dataBahan])

 // PEMANGGILAN TREE: laporan hierarkis dibangun dari data yang berasal dari API.
 const laporan=useMemo(
  ()=>bangunTreeLaporan(laporanData?.transaksi||data.transaksi,laporanData?.pengeluaran||data.pengeluaran),
  [laporanData,data.transaksi,data.pengeluaran]
 )

 // Tahun yang bisa dipilih pada laporan: tahun yang ada datanya + tahun berjalan.
 const daftarTahun=useMemo(()=>{
  const tahun=data.transaksi.concat(data.pengeluaran)
   .map(x=>Number(String(x.tanggal||'').slice(0,4)))
   .filter(t=>t>=2000&&t<=2100)
  tahun.push(TAHUN_SEKARANG)
  return [...new Set(tahun)].sort((a,b)=>b-a)
 },[data.transaksi,data.pengeluaran])

 return { allBahan, laporan, daftarTahun }
}
