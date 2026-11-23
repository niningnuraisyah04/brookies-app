// ============================================================
// ROUTE DASHBOARD & LAPORAN — Tahap D
// ------------------------------------------------------------
// Endpoint ringkasan dan laporan keuntungan (butuh JWT).
// ============================================================

import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { ringkasanDashboard, laporanKeuntungan } from '../controllers/laporanController.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/laporan/dashboard → kartu ringkasan & grafik
router.get('/dashboard', ringkasanDashboard);

// GET /api/laporan/keuntungan → data laporan hierarkis
router.get('/keuntungan', laporanKeuntungan);

export default router;
