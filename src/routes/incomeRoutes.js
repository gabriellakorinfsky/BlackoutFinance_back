import express from "express";
import { createIncome, getAllIncomes } from "../controllers/incomeController.js";
const router = express.Router();

// Rota para adicionar entrada
router.post('/', createIncome);

// Rota para obter todas as postagens
router.get('/', getAllIncomes);

export default router;