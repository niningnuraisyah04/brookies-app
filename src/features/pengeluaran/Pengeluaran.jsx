// FITUR PENGELUARAN — dipindahkan dari App.jsx (Tahap 5).
// Pencarian memakai state `search` milik App; sinkronisasi stok tetap di backend.
import { Plus } from 'lucide-react'
import { bubbleSort } from '@/algorithms/bubbleSort'
import { rupiah, tanggalID } from '@/lib/utils'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Empty from '@/components/common/Empty'
import PageTitle from '@/components/common/PageTitle'

export default function Pengeluaran({ pengeluaran, search, setSearch, startAdd, actionButtons, tableCard }) {
  // BUBBLE SORT: mengurutkan pengeluaran berdasarkan tanggal terbaru sebelum ditampilkan.
  const rows=bubbleSort(pengeluaran.filter(x=>(`${x.id} ${x.nama} ${x.kategori}`).toLowerCase().includes(search.toLowerCase())),'tanggal','desc')
  return <><PageTitle eyebrow="Catatan arus kas keluar" title="Pengeluaran" desc="Catat pembelian bahan baku dan biaya operasional." action={<Button onClick={()=>startAdd('pengeluaran')}><Plus size={16}/>Tambah Pengeluaran</Button>}/><div className="mb-4"><Input placeholder="Cari pengeluaran..." value={search||''} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/></div>{tableCard('Daftar Pengeluaran','Pengeluaran bahan baku menambah stok bahan terkait.',['ID','Tanggal','Kategori','Nama Pengeluaran','Jumlah Beli','Total','Aksi'],rows.map(x=><tr key={x.id}><td className="px-4 py-3">{x.id}</td><td className="px-4 py-3">{tanggalID(x.tanggal)}</td><td className="px-4 py-3">{x.kategori}</td><td className="px-4 py-3">{x.nama}</td><td className="px-4 py-3">{x.jumlahBeli||'-'} {x.satuan}</td><td className="px-4 py-3 font-semibold">{rupiah(x.total)}</td><td className="px-4 py-3">{actionButtons('pengeluaran',x)}</td></tr>))}{!rows.length&&<Empty/>}</>
}
