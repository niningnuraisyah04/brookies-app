// ============================================================
// 1. IMPORT: library, hooks, komponen, dan konstanta
// ============================================================
import { lazy,Suspense,useCallback,useState } from 'react'
import './App.css';

import { status } from '@/constants/app'
import { useAppData } from '@/hooks/useAppData'
import { useDerivedData } from '@/hooks/useDerivedData'
// KOMPONEN UI UMUM: sudah dipindahkan ke src/components/ pada tahap sebelumnya.
import PageTitle from '@/components/common/PageTitle'
import Toast from '@/components/common/Toast'
import PublicLayout from '@/layouts/PublicLayout'
import Home from '@/pages/Home'
import Katalog from '@/pages/Katalog'
import AdminLayout from '@/layouts/AdminLayout'
// FITUR ADMIN (Tahap 14): dimuat malas agar bundle awal publik tetap ringan.
// Logika bisnis tiap halaman tidak diubah, hanya cara memuat komponennya.
const Dashboard=lazy(()=>import('@/features/dashboard/Dashboard'))
const Laporan=lazy(()=>import('@/features/laporan/Laporan'))
const BahanBaku=lazy(()=>import('@/features/bahan-baku/BahanBaku'))
const Resep=lazy(()=>import('@/features/resep/Resep'))
const Produksi=lazy(()=>import('@/features/produksi/Produksi'))
const Transaksi=lazy(()=>import('@/features/transaksi/Transaksi'))
const Pengeluaran=lazy(()=>import('@/features/pengeluaran/Pengeluaran'))
// CRUD, helper tabel, dan autentikasi (Tahap 6–7).
import { useCrud } from '@/features/shared/crud'
import EntityModal from '@/features/shared/EntityModal'
import { buatActionButtons,tableCard } from '@/features/shared/tableHelpers'
import { useAuth } from '@/features/auth/useAuth'
import LoginModal from '@/features/auth/LoginModal'

// Fallback tunggal untuk seluruh halaman admin yang dimuat malas.
// Memakai gaya yang sama dengan penanda pemuatan data agar tidak mengganggu tata letak.
const AdminPageFallback=()=> <div className="py-20 text-center text-[13px] text-muted">Memuat halaman...</div>

// ============================================================
// 2. KOMPONEN UTAMA APLIKASI BROOKIES
// ============================================================
export default function App(){
 // STATE UI: halaman, notifikasi, pencarian, filter, dan urutan tetap di App.
 const [page,setPage]=useState('Beranda')
 // Satu objek notifikasi dengan id unik: pesan baru selalu menggantikan yang lama.
 const [notice,setNotice]=useState(null)
 // Pencarian dipisah per halaman agar kata kunci tidak terbawa saat berpindah menu.
 const [searchTransaksi,setSearchTransaksi]=useState('')
 const [searchPengeluaran,setSearchPengeluaran]=useState('')
 const [searchBahan,setSearchBahan]=useState('')
 const [sortDir,setSortDir]=useState('desc')
 const [filter,setFilter]=useState('Semua Status')

 // Stabil agar effect autentikasi tidak terdaftar ulang setiap render.
 const setPesan=useCallback((teks,jenis='sukses')=>{setNotice(prev=>({teks,jenis,id:(prev?.id||0)+1}))},[])

 // DATA & DERIVASI (Tahap 8): loader MySQL, Hash Map, Tree, dan daftar tahun.
 const {
  data,ringkasan,laporanData,loadingData,tahunLaporan,
  muatSemuaData,gantiTahun,resetData
 }=useAppData({setPesan})

 const {allBahan,laporan,daftarTahun}=useDerivedData({data,laporanData})

 // AUTENTIKASI (Tahap 7): state, sesi, 401, dan form login berada di useAuth.
 const {
  admin,adminNama,authChecking,loginLoading,
  loginOpen,login,setLogin,
  openLogin,closeLogin,doLogin,logout
 }=useAuth({setPesan,muatSemuaData,setPage,resetData})

 // CRUD (Tahap 6): state modal/editing/form dan seluruh fungsi CRUD berada di hook.
 const {modal,editing,form,setForm,startAdd,startEdit,closeModal,saveEntity,delEntity,saving}=useCrud({data,allBahan,setPesan,muatSemuaData})
 const actionButtons=buatActionButtons(startEdit,delEntity)

 // TAMPILAN HALAMAN PUBLIK (Beranda dan Katalog).
 const publicPage=<PublicLayout setPage={setPage} openLogin={openLogin}>
  {page==='Beranda'?<Home setPage={setPage}/>:<Katalog/>}
 </PublicLayout>

 if(authChecking){
  return <div className="min-h-screen flex items-center justify-center">
   Memeriksa sesi Admin...
  </div>;
 }

 if(!admin)return <>{publicPage}<LoginModal loginOpen={loginOpen} login={login} setLogin={setLogin} doLogin={doLogin} closeLogin={closeLogin} loading={loginLoading}/>{notice&&<Toast key={notice.id} text={notice.teks} jenis={notice.jenis} close={()=>setNotice(null)}/>}</>

 // ============================================================
 // 3. MENENTUKAN KONTEN HALAMAN ADMIN
 // ============================================================
 let content
 if(page==='Dashboard'){
  content=<Dashboard ringkasan={ringkasan} transaksi={data.transaksi} allBahan={allBahan} status={status} setPage={setPage}/>
 }else if(page==='Transaksi'){
  content=<Transaksi transaksi={data.transaksi} search={searchTransaksi} setSearch={setSearchTransaksi} filter={filter} setFilter={setFilter} sortDir={sortDir} setSortDir={setSortDir} status={status} startAdd={startAdd} actionButtons={actionButtons} tableCard={tableCard}/>
 }else if(page==='Pengeluaran'){
  content=<Pengeluaran pengeluaran={data.pengeluaran} search={searchPengeluaran} setSearch={setSearchPengeluaran} startAdd={startAdd} actionButtons={actionButtons} tableCard={tableCard}/>
 }else if(page==='Bahan Baku'){
  content=<BahanBaku allBahan={allBahan} search={searchBahan} setSearch={setSearchBahan} startAdd={startAdd} actionButtons={actionButtons} tableCard={tableCard}/>
 }else if(page==='Data Resep'){
  content=<Resep resep={data.resep} dataBahan={data.dataBahan} startAdd={startAdd} actionButtons={actionButtons} tableCard={tableCard}/>
 }else if(page==='Produksi'){
  content=<Produksi produksi={data.produksi} startAdd={startAdd} actionButtons={actionButtons} tableCard={tableCard}/>
 }else if(page==='Laporan Keuntungan'){
  content=<Laporan laporan={laporan} laporanData={laporanData} tahunLaporan={tahunLaporan} daftarTahun={daftarTahun} gantiTahun={gantiTahun}/>
 }else content=<><PageTitle eyebrow="Pengelolaan usaha" title={page} desc="Pilih menu dari navigasi untuk mengelola data Brookies."/></>

 // RENDER AKHIR: navigasi admin, konten halaman, dan modal.
 return <AdminLayout page={page} setPage={setPage} logout={logout} adminNama={adminNama} loadingData={loadingData} content={<Suspense fallback={<AdminPageFallback/>}>{content}</Suspense>}>
 <EntityModal modal={modal} editing={editing} form={form} setForm={setForm} status={status} allBahan={allBahan} dataBahan={data.dataBahan} closeModal={closeModal} saveEntity={saveEntity} loading={saving}/>
 {notice&&<Toast key={notice.id} text={notice.teks} jenis={notice.jenis} close={()=>setNotice(null)}/>}
 </AdminLayout>
}
