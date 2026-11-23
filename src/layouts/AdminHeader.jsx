// KOMPONEN ADMIN — dipindahkan dari App.jsx (Tahap 4).
import { Bell } from 'lucide-react'

export default function AdminHeader({ adminNama }) {
  return <header className="sticky top-0 z-20 flex h-[78px] items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur md:px-10"><div><p className="text-eyebrow font-bold uppercase tracking-eyebrow text-red">BROOKIES MANAGEMENT SYSTEM</p><h1 className="font-display text-heading font-bold text-ink">Brookies Management</h1></div><div className="flex items-center gap-3"><span className="hidden text-[13px] text-muted sm:inline">{adminNama}</span><span className="grid h-10 w-10 place-items-center rounded-full bg-pink text-[20px] font-bold text-red">A</span><button className="rounded-control border border-line bg-white p-2.5 text-red"><Bell size={17}/></button></div></header>
}
