// FITUR TRANSAKSI — dipindahkan dari App.jsx (Tahap 5).
// Pencarian, filter status, dan pengurutan tetap memakai state milik App melalui props.
import { Plus, ArrowUpDown } from 'lucide-react'
import { bubbleSort } from '@/algorithms/bubbleSort'
import { rupiah, tanggalID } from '@/lib/utils'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import Empty from '@/components/common/Empty'
import PageTitle from '@/components/common/PageTitle'

export default function Transaksi({ transaksi, search, setSearch, filter, setFilter, sortDir, setSortDir, status, startAdd, actionButtons, tableCard }) {
  // BUBBLE SORT: filter terlebih dahulu, baru diurutkan sesuai arah sortDir.
  const rows=bubbleSort(transaksi.filter(x=>(`${x.id} ${x.produk} ${x.saluran}`).toLowerCase().includes(search.toLowerCase())&&(filter==='Semua Status'||x.status===filter)),'tanggal',sortDir)
  return <><PageTitle eyebrow="Kelola pesanan Brookies" title="Transaksi" desc="Catat dan pantau pesanan pelanggan." action={<Button onClick={()=>startAdd('transaksi')}><Plus size={16}/>Tambah Transaksi</Button>}/><div className="mb-4 flex flex-wrap gap-2"><Input placeholder="Cari transaksi..." value={search} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/><Select value={filter} onChange={e=>setFilter(e.target.value)} className="max-w-xs"><option>Semua Status</option>{status.map(s=><option key={s}>{s}</option>)}</Select><Button kind="outline" onClick={()=>setSortDir(sortDir==='asc'?'desc':'asc')}><ArrowUpDown size={15}/>Tanggal {sortDir==='asc'?'Terlama':'Terbaru'}</Button></div>{tableCard('Daftar Transaksi','Pendapatan hanya dihitung ketika status transaksi selesai.',['ID','Tanggal','Produk','Saluran','Jumlah','Total','Status','Aksi'],rows.map(x=><tr key={x.id}><td className="px-4 py-3">{x.id}</td><td className="px-4 py-3">{tanggalID(x.tanggal)}</td><td className="px-4 py-3">{x.produk}</td><td className="px-4 py-3">{x.saluran}</td><td className="px-4 py-3">{x.jumlahProduk}</td><td className="px-4 py-3 font-semibold">{rupiah(x.total)}</td><td className="px-4 py-3">{x.status}</td><td className="px-4 py-3">{actionButtons('transaksi',x)}</td></tr>))}{!rows.length&&<Empty/>}</>
}
