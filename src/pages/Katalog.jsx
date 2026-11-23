// HALAMAN PUBLIK — dipindahkan dari App.jsx (Tahap 3).
import { dataMenu } from '@/data/master'
import PageTitle from '@/components/common/PageTitle'
import ProductGrid from '@/components/common/ProductGrid'

export default function Katalog() {
  return <main className="mx-auto max-w-7xl px-6 py-12"><PageTitle variant="public" eyebrow="Pilihan rasa untuk setiap suasana" title="Katalog Brookies" desc="Pilih cookies favoritmu."/><ProductGrid items={dataMenu}/></main>
}
