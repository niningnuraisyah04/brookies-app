// ============================================================
// PEMBATAS PERCOBAAN LOGIN — Tahap 7
// ------------------------------------------------------------
// Penyimpanan dalam memori proses: cukup untuk satu instance Render.
// Tidak menyimpan username/IP ke disk dan tidak menyingkap akun.
// ============================================================

const JENDELA_MS = 15 * 60 * 1000;
const BATAS_PERCOBAAN = 5;
const BATAS_ENTRI = 5000;

const percobaanPerIp = new Map();

function bersihkanEntriKedaluwarsa(sekarang) {
  for (const [ip, entri] of percobaanPerIp) {
    if (sekarang - entri.mulai >= JENDELA_MS) percobaanPerIp.delete(ip);
  }
}

export function batasPercobaanLogin(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const sekarang = Date.now();

  if (percobaanPerIp.size >= BATAS_ENTRI) bersihkanEntriKedaluwarsa(sekarang);

  let entri = percobaanPerIp.get(ip);
  if (!entri || sekarang - entri.mulai >= JENDELA_MS) {
    entri = { mulai: sekarang, jumlah: 0 };
    percobaanPerIp.set(ip, entri);
  }
  entri.jumlah += 1;

  if (entri.jumlah > BATAS_PERCOBAAN) {
    const sisaDetik = Math.ceil((JENDELA_MS - (sekarang - entri.mulai)) / 1000);
    res.set('Retry-After', String(sisaDetik));
    return res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login. Silakan coba lagi beberapa saat lagi.',
    });
  }

  next();
}
