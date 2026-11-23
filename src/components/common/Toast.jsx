// KOMPONEN UI — dipindahkan dari App.jsx (Tahap 2), auto-dismiss ditambahkan Tahap 13.
// Satu timer per pesan: dibersihkan saat pesan berubah atau komponen unmount.
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Toast({text,close,jenis='sukses',durasi=5000}){
 const tutupRef=useRef(close)
 useEffect(()=>{tutupRef.current=close},[close])
 useEffect(()=>{
  if(!text)return undefined
  const timer=setTimeout(()=>tutupRef.current?.(),durasi)
  return ()=>clearTimeout(timer)
 },[text,durasi])

 return <div role="status" aria-live="polite" className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 rounded-control px-4 py-3 text-[13px] font-semibold text-white shadow-xl ${jenis==='gagal'?'bg-red':'bg-brown'}`}><span>{jenis==='gagal'?'⚠':'✓'}</span><span>{text}</span><button type="button" aria-label="Tutup notifikasi" onClick={close}><X size={15}/></button></div>
}
