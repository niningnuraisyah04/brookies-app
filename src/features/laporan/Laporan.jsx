// FITUR LAPORAN — dipindahkan dari App.jsx (Tahap 5).
// Tree tetap berasal dari bangunTreeLaporan yang dihitung App; filter tahun memanggil gantiTahun milik App.
import { rupiah } from '@/lib/utils'
import Select from '@/components/common/Select'
import Empty from '@/components/common/Empty'
import Stat from '@/components/common/Stat'
import PageTitle from '@/components/common/PageTitle'

export default function Laporan({ laporan, laporanData, tahunLaporan, daftarTahun, gantiTahun }) {
  // TREE: mengambil anak dari akar laporan, yaitu kumpulan node tahun untuk ditampilkan bertingkat.
  const yearNodes=laporan.anak
  // Statistik memakai ringkasan dari response laporan yang sudah terfilter tahun.
  const ringkasanLaporan=laporanData?.ringkasan||{}
  return <><PageTitle eyebrow="Rekap keuangan usaha" title="Laporan Keuntungan" action={<Select value={String(tahunLaporan)} onChange={e=>gantiTahun(Number(e.target.value))} className="max-w-[120px]">{daftarTahun.map(t=><option key={t} value={t}>{t}</option>)}</Select>} desc="Laporan hierarkis berdasarkan tahun, bulan, dan hari."/><div className="grid gap-4 sm:grid-cols-3"><Stat label="Pendapatan" value={rupiah(ringkasanLaporan.pendapatan)}/><Stat label="Pengeluaran" value={rupiah(ringkasanLaporan.pengeluaran)}/><Stat label="Keuntungan" value={rupiah(ringkasanLaporan.keuntungan)}/></div><div className="mt-5 rounded-panel border border-line bg-white p-5"><h3 className="mb-4 font-bold">Rincian laporan</h3>{yearNodes.length?yearNodes.map(y=><details key={y.label} className="border-b border-line py-3"><summary className="cursor-pointer font-semibold">{y.label} · Pendapatan {rupiah(y.income)} · Pengeluaran {rupiah(y.expense)} · Keuntungan {rupiah(y.profit)}</summary><div className="ml-5 mt-3 space-y-2">{y.anak.map(m=><details key={m.label}><summary className="cursor-pointer text-[12px]">{m.label} · {rupiah(m.profit)}</summary><div className="ml-5 mt-2 space-y-1 text-[12px] text-muted">{m.anak.map(d=><p key={d.label}>Tanggal {d.label}: Pendapatan {rupiah(d.income)} · Pengeluaran {rupiah(d.expense)} · Keuntungan {rupiah(d.profit)}</p>)}</div></details>)}</div></details>):<Empty text="Laporan akan muncul setelah ada transaksi selesai atau pengeluaran."/>}</div></>
}
