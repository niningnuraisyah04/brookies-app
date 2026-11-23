// FITUR RESEP — dipindahkan dari App.jsx (Tahap 5).
// Hash Map `dataBahan` tetap dipakai lewat .get(); fallback tidak diubah.
import { Plus } from 'lucide-react'
import { bubbleSort } from '@/algorithms/bubbleSort'
import Button from '@/components/common/Button'
import PageTitle from '@/components/common/PageTitle'

export default function Resep({ resep, dataBahan, startAdd, actionButtons, tableCard }) {
  // BUBBLE SORT: mengurutkan daftar resep berdasarkan nama produk sebelum ditampilkan.
  return <><PageTitle eyebrow="Komposisi produk" title="Data Resep" desc="Atur kebutuhan bahan untuk setiap batch produk." action={<Button onClick={()=>startAdd('resep')}><Plus size={16}/>Tambah Baris Resep</Button>}/>{tableCard('Daftar Resep','Satu baris menunjukkan satu bahan untuk suatu produk. Hasil per batch default 10 cookies.',['Produk','ID Bahan','Nama Bahan','Takaran','Satuan','Hasil/Batch','Aksi'],bubbleSort(resep,'produk').map(x=><tr key={x.id}><td className="px-4 py-3">{x.produk}</td><td className="px-4 py-3">{x.idBahan}</td><td className="px-4 py-3">{dataBahan.get(x.idBahan)?.nama||'Bahan tidak ditemukan'}</td><td className="px-4 py-3">{x.jumlah}</td><td className="px-4 py-3">{x.satuan}</td><td className="px-4 py-3">{x.hasilPerBatch}</td><td className="px-4 py-3">{actionButtons('resep',x)}</td></tr>))}</>
}
