// AUTENTIKASI BERSAMA — dipindahkan dari App.jsx (Tahap 7), dirapikan Tahap 8/12.
// Urutan proses dan mekanisme JWT tidak diubah; hanya feedback sesi awal yang ditambah.
import { useCallback, useEffect, useRef, useState } from 'react'
import api, { aturPenangan401 } from '@/services/api'
import { ambilToken, hapusToken } from '@/services/storage'
import { PESAN_SESI_BERAKHIR } from '@/constants/app'

export function useAuth({ setPesan, muatSemuaData, setPage, resetData }) {
 const [admin,setAdminState]=useState(false)
 const adminRef=useRef(false)
 // Ref tetap diperbarui synchronous saat state berubah, seperti baris
 // `adminRef.current=admin` pada kode asli, tanpa menulis ref saat render.
 const setAdmin=useCallback((nilai)=>{adminRef.current=nilai;setAdminState(nilai)},[])
 const [adminNama,setAdminNama]=useState('Administrator')
 const [authChecking,setAuthChecking]=useState(true)
 const [loginOpen,setLoginOpen]=useState(false)
 const [login,setLogin]=useState({user:'',pass:''})
 const [loginLoading,setLoginLoading]=useState(false)
 const loginBusyRef=useRef(false)

 // periksaSesi sengaja memakai fungsi render awal, sama seperti closure
 // useEffect([]) pada App.jsx sebelum dipindahkan.
 const muatAwalRef=useRef(muatSemuaData)
 // Mencegah notifikasi sesi awal ganda saat StrictMode menjalankan effect dua kali.
 const notifikasiSesiRef=useRef(false)

 // ============================================================
 // 401 dari API → kembali ke halaman login. Error lain tidak memicu logout.
 // aturPenangan401 menimpa callback, bukan menambah listener, sehingga
 // pemanggilan ulang akibat StrictMode tidak membuat callback menumpuk.
 // ============================================================
 useEffect(()=>{
  aturPenangan401(()=>{
   if(!adminRef.current)return
   setAdmin(false)
   setAdminNama('Administrator')
   setPage('Beranda')
   setLoginOpen(true)
   setPesan(PESAN_SESI_BERAKHIR,'gagal')
  })
  return ()=>aturPenangan401(null)
 },[setAdmin,setPage,setPesan])

 // Memeriksa sesi admin saat aplikasi dibuka. Data baru dimuat jika token valid.
 // 401 = sesi tidak valid → token dibersihkan. Kegagalan koneksi = token dipertahankan.
 useEffect(()=>{
  async function periksaSesi(){
   if(!ambilToken()){setAuthChecking(false);return}

   try{
    const hasil=await api.cekSesi()
    notifikasiSesiRef.current=false
    setAdmin(true)
    setAdminNama(hasil.admin.nama)
    setPage('Dashboard')
    await muatAwalRef.current()
    setPesan(`Selamat datang kembali, ${hasil.admin.nama}!`)
   }catch(err){
    const gagalAuth=err?.status===401
    if(gagalAuth)hapusToken()
    setAdmin(false)
    if(!notifikasiSesiRef.current){
     notifikasiSesiRef.current=true
     setPesan(gagalAuth?PESAN_SESI_BERAKHIR:(err?.message||'Server tidak dapat dihubungi.'),'gagal')
    }
   }finally{
    setAuthChecking(false)
   }
  }
  periksaSesi()
 },[setAdmin,setPage,setPesan])

 function openLogin(e){e?.preventDefault();setLoginOpen(true)}
 const closeLogin=()=>setLoginOpen(false)

 async function doLogin(e){
  e.preventDefault()
  // Guard synchronous: klik cepat dua kali tidak mengirim request kedua.
  if(loginBusyRef.current)return
  loginBusyRef.current=true
  setLoginLoading(true)
  try{
   // Login melalui API; token JWT disimpan oleh helper storage.
   const hasil=await api.login(login.user,login.pass)

   notifikasiSesiRef.current=false
   setAdmin(true)
   setAdminNama(hasil.admin.nama)
   setPage('Dashboard')
   setLoginOpen(false)
   setLogin({user:'',pass:''})
   setPesan(`Selamat datang, ${hasil.admin.nama}!`)
   await muatSemuaData()
  }catch(err){setPesan(err.message,'gagal')}
  finally{loginBusyRef.current=false;setLoginLoading(false)}
 }

 function logout(){
  hapusToken()
  setAdmin(false)
  setAdminNama('Administrator')
  resetData()
  setPage('Beranda')
 }

 return {
  admin,adminNama,authChecking,loginLoading,
  loginOpen,login,setLogin,
  openLogin,closeLogin,doLogin,logout,
 }
}
