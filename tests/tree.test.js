// Pengujian menyeluruh untuk src/structures/tree.js.
// Mencakup class NodeLaporan, method tambahAnak, dan proses rekursif bangunTreeLaporan.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as treeModule from '../src/structures/tree.js'

const { NodeLaporan, bangunTreeLaporan } = treeModule

const anak = (node, label) => node.anak.find(x => x.label === label)

const ringkas = node => ({
  tingkat: node.tingkat,
  label: node.label,
  income: node.income,
  expense: node.expense,
  profit: node.profit,
  anak: node.anak.length,
})

test('ekspor modul hanya NodeLaporan dan bangunTreeLaporan', () => {
  assert.deepEqual(Object.keys(treeModule).sort(), ['NodeLaporan', 'bangunTreeLaporan'])
})

test('NodeLaporan: nilai awal sesuai konstruktor', () => {
  const node = new NodeLaporan('root', 'Laporan')

  assert.equal(node.tingkat, 'root')
  assert.equal(node.label, 'Laporan')
  assert.equal(node.income, 0)
  assert.equal(node.expense, 0)
  assert.equal(node.profit, 0)
  assert.deepEqual(node.anak, [])
})

test('NodeLaporan: tambahAnak menambah dan mengembalikan node yang sama', () => {
  const root = new NodeLaporan('root', 'Laporan')
  const tahun = new NodeLaporan('tahun', '2026')

  const hasil = root.tambahAnak(tahun)

  assert.strictEqual(hasil, tahun)
  assert.deepEqual(root.anak, [tahun])
  assert.equal(root.anak[0].tingkat, 'tahun')
})

test('NodeLaporan: urutan anak mengikuti urutan tambahAnak', () => {
  const root = new NodeLaporan('root', 'Laporan')
  const a = new NodeLaporan('bulan', '01')
  const b = new NodeLaporan('bulan', '02')
  const c = new NodeLaporan('bulan', '03')

  root.tambahAnak(a)
  root.tambahAnak(b)
  root.tambahAnak(c)

  assert.deepEqual(root.anak.map(x => x.label), ['01', '02', '03'])
  assert.strictEqual(root.anak[0], a)
  assert.strictEqual(root.anak[1], b)
  assert.strictEqual(root.anak[2], c)
})

test('NodeLaporan: chaining tambahAnak menambah ke anak terakhir, bukan ke root', () => {
  const root = new NodeLaporan('root', 'Laporan')
  const bulan = new NodeLaporan('bulan', '01')
  const hari = new NodeLaporan('hari', '15')

  const dikembalikan = root.tambahAnak(bulan).tambahAnak(hari)

  assert.strictEqual(dikembalikan, hari)
  assert.deepEqual(root.anak.map(x => x.label), ['01'])
  assert.deepEqual(bulan.anak.map(x => x.label), ['15'])
  assert.strictEqual(root.anak[0].anak[0], hari)
})

test('NodeLaporan: setiap instance punya array anak sendiri', () => {
  const a = new NodeLaporan('root', 'A')
  const b = new NodeLaporan('root', 'B')

  a.tambahAnak(new NodeLaporan('tahun', '2026'))

  assert.deepEqual(b.anak, [])
  assert.notStrictEqual(a.anak, b.anak)
})

test('NodeLaporan: tidak ada pointer parent maupun method hapus/cari publik', () => {
  const node = new NodeLaporan('root', 'Laporan')

  assert.equal(node.parent, undefined)
  assert.equal(typeof node.hapusAnak, 'undefined')
  assert.equal(typeof node.cariAnak, 'undefined')
})

test('bangunTreeLaporan: input kosong menghasilkan akar tanpa anak', () => {
  const akar = bangunTreeLaporan([], [])

  assert.deepEqual(ringkas(akar), {
    tingkat: 'root',
    label: 'Laporan',
    income: 0,
    expense: 0,
    profit: 0,
    anak: 0,
  })
})

test('bangunTreeLaporan: hierarki akar → tahun → bulan → hari dan agregasi post-order', () => {
  const transaksi = [
    { id: 'T1', tanggal: '2026-01-15', total: '100000', status: 'Selesai' },
    { id: 'T2', tanggal: '2026-01-15', total: 25000, status: 'Selesai' },
    { id: 'T3', tanggal: '2026-01-15', total: 999999, status: 'Diproses' },
    { id: 'T4', tanggal: '2026-01-16', total: 20000, status: 'Selesai' },
    { id: 'T5', tanggal: '2026-01-16', total: 5000, status: 'selesai' },
    { id: 'T6', tanggal: '2026-02-01', total: 75000, status: 'Selesai' },
    { id: 'T7', tanggal: '2026-02-15', total: 10000, status: 'Selesai' },
    { id: 'T8', tanggal: '', total: 50000, status: 'Selesai' },
    { id: 'T9', tanggal: undefined, total: 50000, status: 'Selesai' },
    { id: 'T10', tanggal: '2026-03-10', total: 'tidak-angka', status: 'Selesai' },
    { id: 'T11', tanggal: '2026-03-10', total: -2000, status: 'Selesai' },
  ]
  const pengeluaran = [
    { id: 'P1', tanggal: '2026-01-15', total: 30000 },
    { id: 'P2', tanggal: '2026-01-16', total: '10000' },
    { id: 'P3', tanggal: '2026-02-01', total: 25000 },
    { id: 'P4', tanggal: '2026-02-15', total: 4000 },
    { id: 'P5', tanggal: '2026-03-10', total: 'abc' },
    { id: 'P6', tanggal: '2026-03-10', total: -500 },
    { id: 'P7', tanggal: null, total: 8888 },
  ]
  const transaksiSebelum = transaksi.map(x => ({ ...x }))
  const pengeluaranSebelum = pengeluaran.map(x => ({ ...x }))

  const akar = bangunTreeLaporan(transaksi, pengeluaran)

  assert.deepEqual(transaksi, transaksiSebelum)
  assert.deepEqual(pengeluaran, pengeluaranSebelum)

  assert.deepEqual(ringkas(akar), {
    tingkat: 'root',
    label: 'Laporan',
    income: 228000,
    expense: 68500,
    profit: 159500,
    anak: 1,
  })

  const tahun = anak(akar, '2026')
  assert.ok(tahun)
  assert.deepEqual(ringkas(tahun), {
    tingkat: 'tahun',
    label: '2026',
    income: 228000,
    expense: 68500,
    profit: 159500,
    anak: 3,
  })

  const bulan01 = anak(tahun, '01')
  const bulan02 = anak(tahun, '02')
  const bulan03 = anak(tahun, '03')

  assert.ok(bulan01)
  assert.ok(bulan02)
  assert.ok(bulan03)

  assert.deepEqual(ringkas(bulan01), {
    tingkat: 'bulan',
    label: '01',
    income: 145000,
    expense: 40000,
    profit: 105000,
    anak: 2,
  })
  assert.deepEqual(ringkas(bulan02), {
    tingkat: 'bulan',
    label: '02',
    income: 85000,
    expense: 29000,
    profit: 56000,
    anak: 2,
  })
  assert.deepEqual(ringkas(bulan03), {
    tingkat: 'bulan',
    label: '03',
    income: -2000,
    expense: -500,
    profit: -1500,
    anak: 1,
  })

  const hari15Jan = anak(bulan01, '15')
  const hari16Jan = anak(bulan01, '16')
  const hari01Feb = anak(bulan02, '01')
  const hari15Feb = anak(bulan02, '15')
  const hari10Mar = anak(bulan03, '10')

  assert.deepEqual(ringkas(hari15Jan), {
    tingkat: 'hari',
    label: '15',
    income: 125000,
    expense: 30000,
    profit: 95000,
    anak: 0,
  })
  assert.deepEqual(ringkas(hari16Jan), {
    tingkat: 'hari',
    label: '16',
    income: 20000,
    expense: 10000,
    profit: 10000,
    anak: 0,
  })
  assert.deepEqual(ringkas(hari01Feb), {
    tingkat: 'hari',
    label: '01',
    income: 75000,
    expense: 25000,
    profit: 50000,
    anak: 0,
  })
  assert.deepEqual(ringkas(hari15Feb), {
    tingkat: 'hari',
    label: '15',
    income: 10000,
    expense: 4000,
    profit: 6000,
    anak: 0,
  })
  assert.deepEqual(ringkas(hari10Mar), {
    tingkat: 'hari',
    label: '10',
    income: -2000,
    expense: -500,
    profit: -1500,
    anak: 0,
  })

  assert.notStrictEqual(hari15Jan, hari15Feb)
})

test('bangunTreeLaporan: hanya transaksi berstatus persis Selesai yang dihitung', () => {
  const akar = bangunTreeLaporan([
    { tanggal: '2026-01-01', total: 100, status: 'Selesai' },
    { tanggal: '2026-01-01', total: 999, status: 'Diterima' },
    { tanggal: '2026-01-01', total: 888, status: 'selesai' },
  ], [])

  const bulan01 = anak(anak(akar, '2026'), '01')
  assert.equal(bulan01.anak.length, 1)

  const hari = anak(bulan01, '01')
  assert.equal(hari.income, 100)
  assert.equal(hari.expense, 0)
  assert.equal(hari.profit, 100)
})

test('bangunTreeLaporan: tanggal kosong diabaikan', () => {
  const akar = bangunTreeLaporan([
    { tanggal: '', total: 100, status: 'Selesai' },
    { tanggal: null, total: 200, status: 'Selesai' },
    { tanggal: undefined, total: 300, status: 'Selesai' },
  ], [
    { tanggal: '', total: 50 },
    { tanggal: null, total: 60 },
  ])

  assert.equal(akar.anak.length, 0)
  assert.equal(akar.income, 0)
  assert.equal(akar.expense, 0)
  assert.equal(akar.profit, 0)
})

test('bangunTreeLaporan: total bukan angka menjadi 0', () => {
  const akar = bangunTreeLaporan([
    { tanggal: '2026-01-01', total: 'abc', status: 'Selesai' },
  ], [
    { tanggal: '2026-01-01', total: 'xyz' },
  ])

  const hari = anak(anak(anak(akar, '2026'), '01'), '01')

  assert.equal(hari.income, 0)
  assert.equal(hari.expense, 0)
  assert.equal(hari.profit, 0)
})

test('bangunTreeLaporan: total negatif tetap masuk sebagai nilai negatif', () => {
  const akar = bangunTreeLaporan([
    { tanggal: '2026-01-01', total: -5, status: 'Selesai' },
  ], [
    { tanggal: '2026-01-01', total: -2 },
  ])

  const hari = anak(anak(anak(akar, '2026'), '01'), '01')

  assert.equal(hari.income, -5)
  assert.equal(hari.expense, -2)
  assert.equal(hari.profit, -3)
})

test('bangunTreeLaporan: tanggal yang sama tidak membuat node duplikat', () => {
  const akar = bangunTreeLaporan([
    { tanggal: '2026-01-15', total: 10, status: 'Selesai' },
    { tanggal: '2026-01-15', total: 20, status: 'Selesai' },
  ], [
    { tanggal: '2026-01-15', total: 5 },
  ])

  assert.equal(akar.anak.length, 1)

  const tahun = anak(akar, '2026')
  const bulan = anak(tahun, '01')

  assert.equal(tahun.anak.length, 1)
  assert.equal(bulan.anak.length, 1)

  const hari = anak(bulan, '15')
  assert.equal(hari.income, 30)
  assert.equal(hari.expense, 5)
  assert.equal(hari.profit, 25)
})
