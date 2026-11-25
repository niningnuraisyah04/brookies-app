// Pengujian menyeluruh untuk src/structures/arrayList.js.
// Modul ini murni: tidak memakai API, database, React, atau DOM.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as arrayList from '../src/structures/arrayList.js'

const { tambahItem, ubahItem, hapusItem, cariItem } = arrayList

test('ekspor modul hanya empat operasi Array/List', () => {
  assert.deepEqual(Object.keys(arrayList).sort(), [
    'cariItem',
    'hapusItem',
    'tambahItem',
    'ubahItem',
  ])
})

test('tambahItem: menambah di akhir dan mengembalikan array baru', () => {
  const awal = [{ id: 'BH-001', nama: 'Coklat' }]
  const hasil = tambahItem(awal, { id: 'BH-002', nama: 'Matcha' })

  assert.equal(hasil.length, 2)
  assert.deepEqual(hasil[1], { id: 'BH-002', nama: 'Matcha' })
  assert.deepEqual(awal, [{ id: 'BH-001', nama: 'Coklat' }])
  assert.notStrictEqual(hasil, awal)
  assert.strictEqual(hasil[0], awal[0])
})

test('tambahItem: menerima item tanpa id serta id duplikat', () => {
  const awal = [{ id: 'A', nama: 'Pertama' }]
  const tanpaId = tambahItem(awal, { nama: 'Tanpa ID' })
  const duplikat = tambahItem(tanpaId, { id: 'A', nama: 'Duplikat' })

  assert.deepEqual(tanpaId.map(x => x.id), ['A', undefined])
  assert.deepEqual(duplikat.map(x => x.id), ['A', undefined, 'A'])
  assert.deepEqual(duplikat[2], { id: 'A', nama: 'Duplikat' })
  assert.equal(awal.length, 1)
})

test('tambahItem: boundary array kosong', () => {
  const hasil = tambahItem([], { id: 'A' })
  assert.deepEqual(hasil, [{ id: 'A' }])
})

test('tambahItem: error bila input bukan iterable', () => {
  assert.throws(() => tambahItem(null, { id: 'A' }), TypeError)
  assert.throws(() => tambahItem(undefined, { id: 'A' }), TypeError)
})

test('ubahItem: memperbarui semua item dengan id sama', () => {
  const awal = [
    { id: 'A', nilai: 1 },
    { id: 'A', nilai: 2 },
    { id: 'B', nilai: 3 },
  ]
  const hasil = ubahItem(awal, 'A', { nilai: 9 })

  assert.deepEqual(hasil.map(x => x.nilai), [9, 9, 3])
  assert.deepEqual(awal.map(x => x.nilai), [1, 2, 3])
  assert.notStrictEqual(hasil, awal)
  assert.notStrictEqual(hasil[0], awal[0])
})

test('ubahItem: mempertahankan referensi item yang tidak cocok', () => {
  const awal = [
    { id: 'A', nama: 'Coklat' },
    { id: 'B', nama: 'Matcha' },
  ]
  const hasil = ubahItem(awal, 'A', { nama: 'Vanila' })

  assert.strictEqual(hasil[1], awal[1])
  assert.deepEqual(hasil[0], { id: 'A', nama: 'Vanila' })
})

test('ubahItem: perbandingan id bersifat strict', () => {
  const awal = [
    { id: 1, nama: 'Angka' },
    { id: '1', nama: 'String' },
  ]
  const hasil = ubahItem(awal, 1, { nama: 'Diubah' })

  assert.equal(hasil[0].nama, 'Diubah')
  assert.equal(hasil[1].nama, 'String')
})

test('ubahItem: perubahan dapat menimpa id', () => {
  const awal = [{ id: 'A', nama: 'Coklat' }]
  const hasil = ubahItem(awal, 'A', { id: 'Z' })

  assert.deepEqual(hasil, [{ id: 'Z', nama: 'Coklat' }])
  assert.equal(cariItem(hasil, 'A'), undefined)
  assert.equal(cariItem(hasil, 'Z'), hasil[0])
})

test('ubahItem: perubahan null tidak menambah properti', () => {
  const awal = [{ id: 'A', nama: 'Coklat' }]
  const hasil = ubahItem(awal, 'A', null)

  assert.deepEqual(hasil, [{ id: 'A', nama: 'Coklat' }])
  assert.notStrictEqual(hasil[0], awal[0])
})

test('ubahItem: boundary tidak ada kecocokan dan array kosong', () => {
  const awal = [{ id: 'A', nama: 'Coklat' }]
  const tidakAda = ubahItem(awal, 'B', { nama: 'Matcha' })
  const kosong = ubahItem([], 'A', { nama: 'Matcha' })

  assert.deepEqual(tidakAda, awal)
  assert.notStrictEqual(tidakAda, awal)
  assert.deepEqual(kosong, [])
})

test('ubahItem: error bila list null', () => {
  assert.throws(() => ubahItem(null, 'A', { nama: 'X' }), TypeError)
})

test('hapusItem: menghapus semua item dengan id sama', () => {
  const awal = [
    { id: 'A', nama: 'Pertama' },
    { id: 'B', nama: 'Kedua' },
    { id: 'B', nama: 'Ketiga' },
  ]
  const hasil = hapusItem(awal, 'B')

  assert.deepEqual(hasil, [{ id: 'A', nama: 'Pertama' }])
  assert.equal(awal.length, 3)
  assert.notStrictEqual(hasil, awal)
})

test('hapusItem: perbandingan id bersifat strict', () => {
  const awal = [{ id: 1, nama: 'Angka' }, { id: '1', nama: 'String' }]
  const hasil = hapusItem(awal, 1)

  assert.deepEqual(hasil, [{ id: '1', nama: 'String' }])
  assert.deepEqual(awal.map(x => x.id), [1, '1'])
})

test('hapusItem: boundary tidak ada kecocokan dan array kosong', () => {
  const awal = [{ id: 'A', nama: 'Coklat' }]
  const tidakAda = hapusItem(awal, 'B')

  assert.deepEqual(tidakAda, awal)
  assert.notStrictEqual(tidakAda, awal)
  assert.deepEqual(hapusItem([], 'A'), [])
})

test('hapusItem: error bila list null', () => {
  assert.throws(() => hapusItem(null, 'A'), TypeError)
})

test('cariItem: mengembalikan item pertama berdasarkan referensi', () => {
  const pertama = { id: 'A', nama: 'Pertama' }
  const awal = [pertama, { id: 'A', nama: 'Kedua' }]

  assert.strictEqual(cariItem(awal, 'A'), pertama)
})

test('cariItem: undefined bila tidak ditemukan', () => {
  const awal = [{ id: 'A', nama: 'Pertama' }]

  assert.strictEqual(cariItem(awal, 'B'), undefined)
  assert.strictEqual(cariItem([], 'A'), undefined)
})

test('cariItem: perbandingan id bersifat strict', () => {
  const awal = [{ id: 1, nama: 'Angka' }, { id: '1', nama: 'String' }]

  assert.strictEqual(cariItem(awal, 1), awal[0])
  assert.strictEqual(cariItem(awal, '1'), awal[1])
})

test('cariItem: error bila elemen list null', () => {
  assert.throws(() => cariItem([null, { id: 'A' }], 'A'), TypeError)
})

test('kombinasi: alur tambah → ubah → cari → hapus → verifikasi', () => {
  let daftar = []
  daftar = tambahItem(daftar, { id: 'BH-001', nama: 'Coklat', stok: 10 })
  daftar = tambahItem(daftar, { id: 'BH-002', nama: 'Matcha', stok: 5 })
  daftar = ubahItem(daftar, 'BH-002', { stok: 8 })

  assert.deepEqual(cariItem(daftar, 'BH-002'), { id: 'BH-002', nama: 'Matcha', stok: 8 })

  daftar = hapusItem(daftar, 'BH-001')

  assert.equal(cariItem(daftar, 'BH-001'), undefined)
  assert.deepEqual(daftar, [{ id: 'BH-002', nama: 'Matcha', stok: 8 }])
})
