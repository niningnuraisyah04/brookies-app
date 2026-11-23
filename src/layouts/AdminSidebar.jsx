// KOMPONEN ADMIN — dipindahkan dari App.jsx (Tahap 4).
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Package,
  BookOpen,
  Factory,
  ChartNoAxesCombined,
  Cookie,
  LogOut
} from 'lucide-react'

// Definisi menu dipindahkan bersama Sidebar; state aktif tetap milik App (props `page`).
const nav=[['Dashboard',LayoutDashboard],['Transaksi',ShoppingCart],['Pengeluaran',Wallet],['Bahan Baku',Package],['Data Resep',BookOpen],['Produksi',Factory],['Laporan Keuntungan',ChartNoAxesCombined]]

export default function AdminSidebar({ page, setPage, logout }) {
  return <aside className="fixed inset-y-0 left-0 z-40 flex w-[74px] flex-col bg-brown text-footer md:w-[245px] lg:w-[300px]"><div className="flex h-[78px] items-center justify-center gap-3 border-b border-white/20 px-4 md:justify-start md:px-6"><span className="rounded-full bg-pink p-2 text-red"><Cookie/></span><div><p className="hidden font-display text-brand font-extrabold text-white md:block">BROOKIES</p><p className="hidden text-[12px] tracking-[1px] text-footer-sub md:block">ADMIN PANEL</p></div></div><p className="hidden px-6 pb-3 pt-7 text-[11px] font-bold uppercase tracking-[2px] text-side-caption md:block">Menu Utama</p><nav className="flex-1 space-y-1 px-3">{nav.map(([label,Icon])=><button key={label} onClick={()=>setPage(label)} className={`flex w-full items-center justify-center gap-3 rounded-panel px-2 py-3 text-left text-sm font-semibold md:justify-start md:px-4 ${page===label?'bg-active text-white':'text-footer hover:bg-active'}`}><Icon size={18}/><span className="hidden md:inline">{label}</span></button>)}</nav><button onClick={logout} className="flex items-center justify-center gap-3 border-t border-white/20 px-4 py-5 text-[13px] font-semibold text-footer md:justify-start md:px-6"><LogOut size={17}/><span className="hidden md:inline">Keluar Admin</span></button></aside>
}
