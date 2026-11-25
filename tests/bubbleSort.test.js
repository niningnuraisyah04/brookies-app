// Pengujian menyeluruh untuk src/algorithms/bubbleSort.js.
// Modul ini murni: tidak memakai API, database, React, atau DOM.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as bubbleSortModule from '../src/algorithms/bubbleSort.js'

const { bubbleSort } = bubbleSortModule

test('ekspor modul hanya bubbleSort', () => {
  assert.deepEqual(Object.keys(bubbleSortModule), ['bubbleSort'])
})

test('mengembalikan array baru dan tidak memutasi array sumber', () => {
  const awal = [
    { id: 'C', total: 30 },
    { id: 'A', total: 10 },
    { id: 'B', total: 20 },
  ]

  const hasil = bubbleSort(awal, 'total')

  assert.deepEqual(hasil.map(x => x.id), ['A', 'B', 'C'])
  assert.deepEqual(awal.map(x => x.id), ['C', 'A', 'B'])
  assert.notStrictEqual(hasil, awal)
  assert.strictEqual(hasil[0], awal[1])
})

test('mengurutkan angka secara ascending', () => {
  const data = [
    { id: 'C', total: 30 },
    { id: 'A', total: 10 },
    { id: 'B', total: 20 },
  ]

  assert.deepEqual(bubbleSort(data, 'total').map(x => x.id), ['A', 'B', 'C'])
})

test('mengurutkan angka secara descending bila arah desc', () => {
  const data = [
    { id: 'C', total: 30 },
    { id: 'A', total: 10 },
    { id: 'B', total: 20 },
  ]

  assert.deepEqual(bubbleSort(data, 'total', 'desc').map(x => x.id), ['C', 'B', 'A'])
})

test('arah selain desc diperlakukan sebagai ascending', () => {
  const data = [
    { id: 'C', total: 30 },
    { id: 'A', total: 10 },
    { id: 'B', total: 20 },
  ]

  assert.deepEqual(bubbleSort(data, 'total', 'DESC').map(x => x.id), ['A', 'B', 'C'])
  assert.deepEqual(bubbleSort(data, 'total', null).map(x => x.id), ['A', 'B', 'C'])
  assert.deepEqual(bubbleSort(data, 'total').map(x => x.id), ['A', 'B', 'C'])
})

test('string diurutkan dengan locale id dan opsi numeric', () => {
  const data = [
    { id: '10', kode: 'BH-10' },
    { id: '2', kode: 'BH-2' },
    { id: '1', kode: 'BH-1' },
  ]

  assert.deepEqual(bubbleSort(data, 'kode').map(x => x.id), ['1', '2', '10'])
})

test('string non-numerik memakai perbandingan localeCompare biasa', () => {
  const data = [
    { id: 'C', nama: 'coklat' },
    { id: 'A', nama: 'almond' },
    { id: 'B', nama: 'biscoff' },
  ]

  assert.deepEqual(bubbleSort(data, 'nama').map(x => x.id), ['A', 'B', 'C'])
})

test('campuran number dan string masuk ke jalur localeCompare', () => {
  const data = [
    { id: 'A', nilai: 2 },
    { id: 'B', nilai: '10' },
    { id: 'C', nilai: 1 },
  ]

  assert.deepEqual(bubbleSort(data, 'nilai').map(x => x.id), ['C', 'A', 'B'])
})

test('nilai sama tidak ditukar sehingga sort stabil', () => {
  const data = [
    { id: 'A', total: 10, urutan: 1 },
    { id: 'B', total: 10, urutan: 2 },
    { id: 'C', total: 5, urutan: 3 },
  ]

  const hasil = bubbleSort(data, 'total')

  assert.deepEqual(hasil.map(x => x.id), ['C', 'A', 'B'])
  assert.deepEqual(hasil.map(x => x.urutan), [3, 1, 2])
})

test('properti undefined atau null dibaca sebagai string kosong', () => {
  const data = [
    { id: 'A' },
    { id: 'B', nama: 'Bahan' },
    { id: 'C', nama: null },
  ]

  assert.deepEqual(bubbleSort(data, 'nama').map(x => x.id), ['A', 'C', 'B'])
})

test('properti yang tidak ada pada semua item tidak mengubah urutan', () => {
  const data = [{ id: 'A' }, { id: 'B' }, { id: 'C' }]

  const hasil = bubbleSort(data, 'tidakAda')

  assert.deepEqual(hasil.map(x => x.id), ['A', 'B', 'C'])
  assert.notStrictEqual(hasil, data)
})

test('boundary array kosong dan satu elemen', () => {
  assert.deepEqual(bubbleSort([], 'nama'), [])

  const satu = [{ id: 'A', nama: 'Coklat' }]
  const hasil = bubbleSort(satu, 'nama')

  assert.deepEqual(hasil, satu)
  assert.notStrictEqual(hasil, satu)
  assert.strictEqual(hasil[0], satu[0])
})

test('data sudah terurut tetap menjalankan pass penuh tanpa early exit', () => {
  let pembacaan = 0
  const buat = nilai => ({
    get nilai() {
      pembacaan += 1
      return nilai
    },
  })

  const a = buat(1)
  const b = buat(2)
  const c = buat(3)
  const hasil = bubbleSort([a, b, c], 'nilai')

  // 3 elemen → 3 perbandingan → 6 pembacaan properti.
  assert.equal(pembacaan, 6)
  assert.strictEqual(hasil[0], a)
  assert.strictEqual(hasil[1], b)
  assert.strictEqual(hasil[2], c)
})

test('error bila data null atau undefined', () => {
  assert.throws(() => bubbleSort(null, 'nama'), TypeError)
  assert.throws(() => bubbleSort(undefined, 'nama'), TypeError)
})

test('error bila elemen null ikut dibandingkan', () => {
  assert.throws(() => bubbleSort([null, { nama: 'A' }], 'nama'), TypeError)
})

test('kombinasi filter lalu urutkan meniru alur tabel tanpa UI', () => {
  const data = [
    { id: 'T1', tanggal: '2026-01-02', status: 'Selesai' },
    { id: 'T2', tanggal: '2026-01-03', status: 'Dibatalkan' },
    { id: 'T3', tanggal: '2026-01-05', status: 'Selesai' },
    { id: 'T4', tanggal: '2026-01-01', status: 'Selesai' },
  ]

  const selesai = data.filter(x => x.status === 'Selesai')
  const rows = bubbleSort(selesai, 'tanggal', 'desc')

  assert.deepEqual(rows.map(x => x.id), ['T3', 'T1', 'T4'])
  assert.deepEqual(data.map(x => x.id), ['T1', 'T2', 'T3', 'T4'])
  assert.deepEqual(selesai.map(x => x.id), ['T1', 'T3', 'T4'])
})
