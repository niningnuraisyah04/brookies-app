// HALAMAN PUBLIK — dipindahkan dari App.jsx (Tahap 3).
import { ChevronRight } from 'lucide-react'
import { dataMenu } from '@/data/master'
import ProductGrid from '@/components/common/ProductGrid'

export default function Home({ setPage }) {
  return <><section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2"><div><p className="mb-4 text-eyebrow font-bold uppercase tracking-eyebrow text-red">Freshly baked · Homemade</p><h1 className="font-display text-hero font-extrabold leading-[1.08] tracking-[-1px] text-brown">A little bite of <span className="text-red">happiness.</span></h1><p className="mt-6 max-w-lg text-[16px] leading-body text-muted">Nikmati cookies homemade Brookies dengan pilihan rasa yang dibuat untuk menemani momen spesialmu.</p><button onClick={()=>setPage('Katalog')} className="mt-8 rounded-control bg-brown px-5 py-3 text-[13px] font-bold text-white">Lihat Katalog <ChevronRight className="ml-2 inline" size={17}/></button></div>

<div className="h-[320px] overflow-hidden rounded-arch border-8 border-white bg-cream-deep md:h-[420px]">
  <img
    src="/images/brookies-collage.jpg"
    alt="Pilihan cookies Brookies"
    className="h-full w-full object-cover"
  />
</div>

  </section><section className="mx-auto max-w-7xl px-6 pb-20"><div className="mb-6 flex items-end justify-between"><div><p className="text-[13px] text-muted">Pilihan favorit</p><h2 className="font-display text-section font-bold text-brown">Menu Brookies</h2></div><button onClick={()=>setPage('Katalog')} className="text-[13px] font-bold text-red">Lihat semua →</button></div>
  <ProductGrid items={dataMenu.slice(0,4)}/></section></>
}
