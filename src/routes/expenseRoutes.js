import express from "express";
import { createExpense, getAllExpenses } from "../controllers/expenseController.js";
const router = express.Router();

// Rota para adicionar despesa
router.post('/', createExpense);

// Rota para obter todas as postagens
router.get('/', getAllExpenses);

export default router;