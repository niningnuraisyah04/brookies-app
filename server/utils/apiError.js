// ============================================================
// ERROR KHUSUS API — Tahap A
// ------------------------------------------------------------
// Dipakai controller/middleware untuk melempar error dengan
// status HTTP yang jelas. Pesannya aman untuk ditampilkan ke user.
// ============================================================

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Pembantu: error 400 untuk input yang tidak valid.
export const badRequest = (pesan) => new ApiError(400, pesan);

// Pembantu: error 401 untuk token tidak ada/tidak valid.
export const unauthorized = (pesan) => new ApiError(401, pesan);

// Pembantu: error 403 untuk admin yang tidak memiliki akses.
export const forbidden = (pesan) => new ApiError(403, pesan);

// Pembantu: error 404 untuk data yang tidak ditemukan.
export const notFound = (pesan) => new ApiError(404, pesan);

// Pembantu: error 409 untuk data duplikat / konflik.
export const conflict = (pesan) => new ApiError(409, pesan);

// ============================================================
// ASYNC HANDLER
// Express 5 sebenarnya sudah menangkap promise reject, tetapi
// helper ini membuat kode controller lebih rapi dan eksplisit.
// ============================================================
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
