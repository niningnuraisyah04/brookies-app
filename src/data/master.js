// ============================================================
// DATA MASTER BROOKIES
// Menu dan harga mengikuti daftar menu pada prototype Brookies.
// ============================================================
export const dataMenu = [
  {id:'BRK-001',nama:'Original',harga:12000},
  {id:'BRK-002',nama:'Choco Cheese',harga:18000},
  {id:'BRK-003',nama:'Biscoff',harga:18000},
  {id:'BRK-004',nama:'Red Velvet Cheese',harga:15000},
  {id:'BRK-005',nama:'Red Velvet Nutella',harga:15000},
  {id:'BRK-006',nama:'Red Velvet Chips',harga:12000},
  {id:'BRK-007',nama:'Matcha Cheese',harga:18000},
  {id:'BRK-008',nama:'Matcha Nutella',harga:18000},
  {id:'BRK-009',nama:'Blue & Red Monster',harga:25000},
  {id:'BRK-010',nama:'Dubai Cuwi Cookie',harga:35000},
]

// ============================================================
// DATA MASTER BAHAN BAKU
// Stok awal 0 karena stok fisik perlu dihitung oleh pemilik.
// Kebutuhan bulanan dan jumlah pembelian adalah estimasi awal.
// ============================================================
export const dataBahanAwal = [
 ['BH-001','Tepung terigu protein sedang',0,'gram',1000,7500,7500],
 ['BH-002','Butter / mentega',0,'gram',500,3600,3600],
 ['BH-003','Gula palem / brown sugar',0,'gram',500,3000,3000],
 ['BH-004','Gula pasir',0,'gram',300,1800,1800],
 ['BH-005','Telur',0,'butir',2,30,30],
 ['BH-006','Vanili',0,'ml',100,150,200],
 ['BH-007','Baking soda',0,'gram',100,90,100],
 ['BH-008','Garam',0,'gram',100,60,100],
 ['BH-009','Dark chocolate',0,'gram',300,570,600],
 ['BH-010','Chocochips',0,'gram',200,210,300],
 ['BH-011','Keju cheddar',0,'gram',200,180,200],
 ['BH-012','Cream cheese',0,'gram',200,600,600],
 ['BH-013','Biskuit Biscoff',0,'gram',100,120,200],
 ['BH-014','Biscoff spread',0,'gram',200,210,300],
 ['BH-015','Bubuk kakao',0,'gram',100,135,200],
 ['BH-016','Pewarna makanan merah',0,'ml',20,18,100],
 ['BH-017','Nutella / chocolate hazelnut spread',0,'gram',200,600,600],
 ['BH-018','Bubuk matcha',0,'gram',50,60,100],
 ['BH-019','Cokelat putih',0,'gram',100,150,200],
 ['BH-020','Pewarna makanan biru',0,'ml',20,6,100],
 ['BH-021','Sprinkles warna-warni',0,'gram',50,75,100],
 ['BH-022','Mini marshmallow',0,'gram',100,120,200],
 ['BH-023','Kataifi / kunafa pastry',0,'gram',200,300,300],
 ['BH-024','Pistachio cream',0,'gram',200,360,400],
 ['BH-025','Pistachio cincang',0,'gram',50,60,100],
 ['BH-026','Tahini',0,'gram',50,45,100],
 ['BH-027','Minyak netral',0,'ml',100,30,100],
].map(([id,nama,stok,satuan,minimum,kebutuhanBulanan,jumlahBeli])=>({
  id,nama,stok,satuan,minimum,kebutuhanBulanan,jumlahBeli,
  // Estimasi harga total untuk kebutuhan bulanan; sesuaikan dengan harga supplier Brookies.
  hargaBahan: ({
    'BH-001':112500,'BH-002':288000,'BH-003':144000,'BH-004':31500,
    'BH-005':75000,'BH-006':80000,'BH-007':7000,'BH-008':1500,
    'BH-009':67500,'BH-010':30000,'BH-011':29000,'BH-012':121000,
    'BH-013':40000,'BH-014':60000,'BH-015':12000,'BH-016':27500,
    'BH-017':163000,'BH-018':42500,'BH-019':22500,'BH-020':27500,
    'BH-021':6500,'BH-022':25500,'BH-023':39000,'BH-024':32000,
    'BH-025':31000,'BH-026':15000,'BH-027':2000
  })[id] || 0
}))

// ============================================================
// DATA RESEP ESTIMASI
// Satu batch diasumsikan menghasilkan 10 cookies.
// Takaran wajib divalidasi dengan resep produksi aktual Brookies.
// ============================================================
const dasar = {'BH-001':250,'BH-002':120,'BH-003':100,'BH-004':60,'BH-005':1,'BH-006':5,'BH-007':3,'BH-008':2}
const resepObj = {
 'Original':{...dasar},
 'Choco Cheese':{...dasar,'BH-009':50,'BH-011':60},
 'Biscoff':{...dasar,'BH-013':40,'BH-014':70},
 'Red Velvet Cheese':{...dasar,'BH-015':15,'BH-016':3,'BH-012':100},
 'Red Velvet Nutella':{...dasar,'BH-015':15,'BH-016':3,'BH-017':100},
 'Red Velvet Chips':{...dasar,'BH-015':15,'BH-016':3,'BH-010':70},
 'Matcha Cheese':{...dasar,'BH-018':10,'BH-012':100},
 'Matcha Nutella':{...dasar,'BH-018':10,'BH-017':100},
 'Blue & Red Monster':{...dasar,'BH-009':40,'BH-019':50,'BH-020':2,'BH-021':25,'BH-022':40},
 'Dubai Cuwi Cookie':{...dasar,'BH-015':15,'BH-009':100,'BH-023':100,'BH-024':120,'BH-025':20,'BH-026':15,'BH-027':10},
}
export const dataResepAwal = Object.entries(resepObj).flatMap(([produk,bahan])=>Object.entries(bahan).map(([idBahan,jumlah],i)=>({
 id:`RSP-${produk.toUpperCase().replaceAll(' ','-').replaceAll('&','DAN')}-${i+1}`,produk,idBahan,jumlah,
 satuan:['BH-005'].includes(idBahan)?'butir':['BH-006','BH-016','BH-020','BH-027'].includes(idBahan)?'ml':'gram',hasilPerBatch:10
})))
