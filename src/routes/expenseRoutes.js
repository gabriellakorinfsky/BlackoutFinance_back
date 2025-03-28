import express from "express";
import expenseController from "../controllers/expenseController.js";
const router = express.Router();

// Rota para adicionar despesa
router.post('/', expenseController.createExpense);

// Rota para obter todas as postagens
router.get('/', expenseController.getAllExpenses);

module.exports = router;