// KOMPONEN UI — dipindahkan dari App.jsx (Tahap 2), disempurnakan Tahap 13.
// Escape/backdrop menutup modal; klik di konten tidak. Desain dan tombol X tetap.
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'

export default function Modal({title,onClose,children,loading=false,className=''}){
 const kontenRef=useRef(null)
 const tutupRef=useRef(onClose)
 const sibukRef=useRef(loading)
 useEffect(()=>{tutupRef.current=onClose},[onClose])
 useEffect(()=>{sibukRef.current=loading},[loading])

 // Satu listener keyboard untuk seluruh modal; dibersihkan saat unmount.
 useEffect(()=>{
  const handleKey=(e)=>{
   if(e.key==='Escape'&&!sibukRef.current){e.stopPropagation();tutupRef.current?.()}
  }
  document.addEventListener('keydown',handleKey)
  return ()=>document.removeEventListener('keydown',handleKey)
 },[])

 // Fokus keyboard masuk ke modal dan kembali ke elemen sebelumnya saat ditutup.
 useEffect(()=>{
  const sebelumnya=document.activeElement
  kontenRef.current?.focus()
  return ()=>{if(sebelumnya&&typeof sebelumnya.focus==='function')sebelumnya.focus()}
 },[])

 const tutupBackdrop=(e)=>{
  if(e.target!==e.currentTarget)return
  if(sibukRef.current)return
  tutupRef.current?.()
 }

 return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brown/45 p-4" onMouseDown={tutupBackdrop}><motion.div ref={kontenRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onMouseDown={e=>e.stopPropagation()} initial={{opacity:0,y:12,scale:.98}} animate={{opacity:1,y:0,scale:1}} className={`max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-card border border-line bg-white p-6 shadow-2xl outline-none ${className}`}><div className="mb-5 flex items-center justify-between"><h3 className="font-display text-panel font-bold text-ink">{title}</h3><button type="button" onClick={onClose} disabled={loading} aria-label="Tutup" className="rounded-control p-2 hover:bg-cream-deep disabled:cursor-not-allowed disabled:opacity-50"><X size={18}/></button></div>{children}</motion.div></div>
}
