// FITUR PRODUKSI — dipindahkan dari App.jsx (Tahap 5).
// Badge dan guard "tanpa snapshot" tetap berasal dari data produksi lama yang sudah dimuat App.
import { Plus } from 'lucide-react'
import { tanggalID } from '@/lib/utils'
import Button from '@/components/common/Button'
import Empty from '@/components/common/Empty'
import PageTitle from '@/components/common/PageTitle'

export default function Produksi({ produksi, startAdd, actionButtons, tableCard }) {
  return <><PageTitle eyebrow="Aktivitas pembuatan produk" title="Produksi" desc="Catat batch produksi dan kurangi stok bahan sesuai resep." action={<Button onClick={()=>startAdd('produksi')}><Plus size={16}/>Catat Produksi</Button>}/>{tableCard('Riwayat Produksi','Stok hanya dikurangi setelah seluruh kebutuhan bahan lolos validasi. Catatan lama tanpa snapshot tidak dapat disesuaikan otomatis.',['ID Produksi','Tanggal','Produk','Jumlah Batch','Jumlah Hasil','Aksi'],produksi.map(x=><tr key={x.id}><td className="px-4 py-3">{x.id}{x.sumberSnapshot==='rekonstruksi'&&<span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[10px] text-muted">tanpa snapshot</span>}</td><td className="px-4 py-3">{tanggalID(x.tanggal)}</td><td className="px-4 py-3">{x.produk}</td><td className="px-4 py-3">{x.jumlahBatch}</td><td className="px-4 py-3">{x.jumlahHasil}</td><td className="px-4 py-3">{actionButtons('produksi',x)}</td></tr>))}{!produksi.length&&<Empty text="Belum ada catatan produksi"/>}</>
}
