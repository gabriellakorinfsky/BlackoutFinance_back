import express from "express";
import incomeController from "../controllers/incomeController.js";
const router = express.Router();

// Rota para adicionar entrada
router.post('/', incomeController.createIncome);

// Rota para obter todas as postagens
router.get('/', incomeController.getAllIncomes);

module.exports = router;