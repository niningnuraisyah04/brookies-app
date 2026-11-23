// FITUR BAHAN BAKU — dipindahkan dari App.jsx (Tahap 5).
// Pencarian nama/ID ditambahkan Tahap 13; Bubble Sort dan Hash Map tidak diubah.
import { Plus } from 'lucide-react'
import { bubbleSort } from '@/algorithms/bubbleSort'
import { rupiah } from '@/lib/utils'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Empty from '@/components/common/Empty'
import PageTitle from '@/components/common/PageTitle'

export default function BahanBaku({ allBahan, search, setSearch, startAdd, actionButtons, tableCard }) {
 // Pencarian langsung saat mengetik, case-insensitive, pada nama dan ID bahan.
 const kata=(search||'').trim().toLowerCase()
 const cocok=allBahan.filter(x=>String(x.nama||'').toLowerCase().includes(kata)||String(x.id||'').toLowerCase().includes(kata))
 // BUBBLE SORT: mengurutkan hasil pencarian berdasarkan nama sebelum ditampilkan.
 const rows=bubbleSort(cocok,'nama')
 return <><PageTitle eyebrow="Persediaan bahan produksi" title="Bahan Baku" desc="Kelola stok dan batas minimum bahan." action={<Button onClick={()=>startAdd('bahan')}><Plus size={16}/>Tambah Bahan</Button>}/><div className="mb-4"><Input placeholder="Cari nama atau ID bahan..." value={search||''} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/></div>{tableCard('Daftar Bahan Baku','Estimasi kebutuhan bulanan disediakan sebagai acuan awal.',['ID','Nama Bahan','Stok','Satuan','Batas Minimum','Estimasi Bulanan','Harga Bahan','Aksi'],rows.map(x=><tr key={x.id}><td className="px-4 py-3">{x.id}</td><td className="px-4 py-3 font-medium">{x.nama}</td><td className="px-4 py-3">{x.stok}</td><td className="px-4 py-3">{x.satuan}</td><td className="px-4 py-3">{x.minimum}</td><td className="px-4 py-3">{x.kebutuhanBulanan} {x.satuan}</td><td className="px-4 py-3 font-semibold">{rupiah(x.hargaBahan||0)}</td><td className="px-4 py-3">{actionButtons('bahan',x)}</td></tr>))}{!rows.length&&<Empty text="Bahan tidak ditemukan. Coba kata kunci nama atau ID lain."/>}</>
}
