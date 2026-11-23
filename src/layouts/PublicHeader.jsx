// KOMPONEN PUBLIK — dipindahkan dari App.jsx (Tahap 3).
import { Cookie } from 'lucide-react'

export default function PublicHeader({ setPage, openLogin }) {
  return <header className="sticky top-0 z-30 border-b border-line bg-surface/95 px-6 py-4 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between"><button onClick={()=>setPage('Beranda')} className="flex items-center gap-3"><span className="rounded-full bg-pink p-3 text-red"><Cookie/></span><span className="font-display text-brand font-extrabold tracking-[.7px]">BROOKIES</span></button><nav className="flex items-center gap-3 text-[14px] font-semibold"><button onClick={()=>setPage('Beranda')} className="hidden sm:block hover:text-red">Beranda</button><button onClick={()=>setPage('Katalog')} className="rounded-control px-3 py-2 text-[13px] font-bold hover:bg-cream-deep hover:text-red">Katalog</button><button onClick={openLogin} className="rounded-control bg-brown px-4 py-2.5 text-[13px] font-bold text-white">Login Admin</button></nav></div></header>
}
