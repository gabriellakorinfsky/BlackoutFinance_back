import express from "express";
import { createIncome, getAllIncomes, updateIncome, deleteIncome } from "../controllers/incomeController.js";
import { authenticate } from '../middleware/authMiddleware.js';
const router = express.Router();

// Rota para adicionar entrada
router.post('/create', authenticate, createIncome);

// Rota para obter todas as postagens
router.get('/', authenticate, getAllIncomes);

// Rota para atualizar uma entrada
router.put('/:id', authenticate, updateIncome);

// Rota para excluir uma entrada
router.delete('/:id', authenticate, deleteIncome);

export default router;