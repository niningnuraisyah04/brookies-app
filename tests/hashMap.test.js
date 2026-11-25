// Pengujian menyeluruh untuk src/structures/hashMap.js.
// Modul ini membungkus Map native; tidak memakai API, database, React, atau DOM.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as hashMap from '../src/structures/hashMap.js'

const { buatHashMapBahan, cariBahan, ubahStokBahan } = hashMap

test('ekspor modul hanya tiga fungsi Hash Map', () => {
  assert.deepEqual(Object.keys(hashMap).sort(), [
    'buatHashMapBahan',
    'cariBahan',
    'ubahStokBahan',
  ])
})

test('buatHashMapBahan: tanpa argumen menghasilkan Map kosong', () => {
  const peta = buatHashMapBahan()

  assert.ok(peta instanceof Map)
  assert.equal(peta.size, 0)
})

test('buatHashMapBahan: key adalah id dan value adalah salinan objek', () => {
  const input = { id: 'BH-001', nama: 'Coklat', stok: 10, satuan: 'gram' }
  const peta = buatHashMapBahan([input])

  assert.ok(peta instanceof Map)
  assert.equal(peta.size, 1)
  assert.deepEqual(peta.get('BH-001'), input)
  assert.notStrictEqual(peta.get('BH-001'), input)
})

test('buatHashMapBahan: id duplikat membuat nilai terakhir menang', () => {
  const peta = buatHashMapBahan([
    { id: 'BH-001', nama: 'Lama', stok: 1 },
    { id: 'BH-001', nama: 'Baru', stok: 2 },
  ])

  assert.equal(peta.size, 1)
  assert.deepEqual(peta.get('BH-001'), { id: 'BH-001', nama: 'Baru', stok: 2 })
})

test('buatHashMapBahan: tipe key dipertahankan apa adanya', () => {
  const peta = buatHashMapBahan([
    { id: 1, nama: 'Angka' },
    { id: '1', nama: 'String' },
  ])

  assert.equal(peta.size, 2)
  assert.equal(peta.get(1).nama, 'Angka')
  assert.equal(peta.get('1').nama, 'String')
})

test('buatHashMapBahan: item tanpa id menjadi key undefined', () => {
  const peta = buatHashMapBahan([{ nama: 'Tanpa ID' }])

  assert.equal(peta.size, 1)
  assert.equal(peta.get(undefined).nama, 'Tanpa ID')
})

test('buatHashMapBahan: error bila daftar bukan array atau berisi null', () => {
  assert.throws(() => buatHashMapBahan(null), TypeError)
  assert.throws(() => buatHashMapBahan([null]), TypeError)
})

test('cariBahan: hasilnya identik dengan .get() native', () => {
  const peta = buatHashMapBahan([{ id: 'BH-001', nama: 'Coklat', stok: 10 }])

  assert.strictEqual(cariBahan(peta, 'BH-001'), peta.get('BH-001'))
  assert.deepEqual(cariBahan(peta, 'BH-001'), { id: 'BH-001', nama: 'Coklat', stok: 10 })
})

test('cariBahan: undefined bila key tidak ada', () => {
  const peta = buatHashMapBahan([{ id: 'BH-001', nama: 'Coklat', stok: 10 }])

  assert.strictEqual(cariBahan(peta, 'BH-999'), undefined)
  assert.strictEqual(cariBahan(buatHashMapBahan(), 'BH-001'), undefined)
})

test('cariBahan: pencarian key bersifat strict', () => {
  const peta = buatHashMapBahan([{ id: 1, nama: 'Angka' }])

  assert.deepEqual(cariBahan(peta, 1), { id: 1, nama: 'Angka' })
  assert.strictEqual(cariBahan(peta, '1'), undefined)
})

test('cariBahan: error bila map null', () => {
  assert.throws(() => cariBahan(null, 'BH-001'), TypeError)
})

test('ubahStokBahan: menambah stok dan mengganti value di Map', () => {
  const peta = buatHashMapBahan([{ id: 'BH-001', nama: 'Coklat', stok: 10, satuan: 'gram' }])
  const nilaiAwal = peta.get('BH-001')

  const hasil = ubahStokBahan(peta, 'BH-001', 3)

  assert.deepEqual(hasil, { id: 'BH-001', nama: 'Coklat', stok: 13, satuan: 'gram' })
  assert.strictEqual(peta.get('BH-001'), hasil)
  assert.equal(nilaiAwal.stok, 10)
  assert.notStrictEqual(nilaiAwal, hasil)
})

test('ubahStokBahan: delta 0 tetap menghasilkan objek baru', () => {
  const peta = buatHashMapBahan([{ id: 'BH-001', nama: 'Coklat', stok: 10 }])
  const nilaiAwal = peta.get('BH-001')

  const hasil = ubahStokBahan(peta, 'BH-001', 0)

  assert.deepEqual(hasil, { id: 'BH-001', nama: 'Coklat', stok: 10 })
  assert.notStrictEqual(hasil, nilaiAwal)
  assert.strictEqual(peta.get('BH-001'), hasil)
})

test('ubahStokBahan: stok boleh tepat mencapai 0', () => {
  const peta = buatHashMapBahan([{ id: 'BH-001', nama: 'Coklat', stok: 10 }])

  const hasil = ubahStokBahan(peta, 'BH-001', -10)

  assert.equal(hasil.stok, 0)
  assert.equal(peta.get('BH-001').stok, 0)
})

test('ubahStokBahan: menolak id yang tidak ditemukan', () => {
  const peta = buatHashMapBahan([{ id: 'BH-001', nama: 'Coklat', stok: 10 }])

  assert.throws(
    () => ubahStokBahan(peta, 'BH-999', 1),
    /Bahan BH-999 tidak ditemukan/
  )
  assert.deepEqual(cariBahan(peta, 'BH-001'), { id: 'BH-001', nama: 'Coklat', stok: 10 })
  assert.equal(peta.size, 1)
})

test('ubahStokBahan: menolak stok negatif dan tidak mengubah Map', () => {
  const peta = buatHashMapBahan([{ id: 'BH-001', nama: 'Coklat', stok: 10 }])

  assert.throws(
    () => ubahStokBahan(peta, 'BH-001', -11),
    /Stok Coklat tidak mencukupi/
  )
  assert.equal(peta.get('BH-001').stok, 10)
})

test('ubahStokBahan: nilai falsy pada Map dianggap tidak ditemukan', () => {
  const peta = new Map([['BH-002', 0]])

  assert.throws(
    () => ubahStokBahan(peta, 'BH-002', 1),
    /Bahan BH-002 tidak ditemukan/
  )
})

test('ubahStokBahan: error bila map null', () => {
  assert.throws(() => ubahStokBahan(null, 'BH-001', 1), TypeError)
})

test('ubahStokBahan: tidak melakukan konversi Number pada stok dan delta', () => {
  const peta = buatHashMapBahan([{ id: 'BH-003', nama: 'Matcha', stok: '10' }])

  const hasil = ubahStokBahan(peta, 'BH-003', 2)

  // Sesuai kode: '10' + 2 -> '102', bukan 12.
  assert.equal(hasil.stok, '102')
  assert.equal(peta.get('BH-003').stok, '102')
})

test('kombinasi: buat → cari → ubah stok → cari lagi', () => {
  const peta = buatHashMapBahan([
    { id: 'BH-001', nama: 'Coklat', stok: 10 },
    { id: 'BH-002', nama: 'Matcha', stok: 5 },
  ])

  const ditemukan = cariBahan(peta, 'BH-001')
  const diubah = ubahStokBahan(peta, 'BH-001', -4)

  assert.strictEqual(cariBahan(peta, 'BH-001'), diubah)
  assert.equal(ditemukan.stok, 10)
  assert.equal(cariBahan(peta, 'BH-001').stok, 6)
  assert.equal(peta.get('BH-001').stok, 6)
  assert.equal(cariBahan(peta, 'BH-002').stok, 5)
})
