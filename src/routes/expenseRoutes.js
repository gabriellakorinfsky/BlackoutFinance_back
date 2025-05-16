import express from "express";
import { createExpense, getAllExpenses, updateExpense, deleteExpense } from "../controllers/expenseController.js";
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota para adicionar despesa
router.post('/create',  authenticate, createExpense);

// Rota para obter todas as despesas
router.get('/', authenticate, getAllExpenses);

// Rota para atualizar uma despesa
router.put('/:id', authenticate, updateExpense);

// Rota para excluir uma despesa
router.delete('/:id', authenticate, deleteExpense);

export default router;