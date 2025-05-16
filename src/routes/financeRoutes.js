import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { financeTotals } from '../controllers/financeController.js';

const router = express.Router();

// Rota para obter os totais financeiros 
router.get('/', authenticate, financeTotals);

export default router;