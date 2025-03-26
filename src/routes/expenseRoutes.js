import express from "express";
import { Expense } from "../models/expense.js";
const router = express.Router();

// Rota para adicionar despesa
router.post('/addExpense', async (req, res) => {
    const { value, category, description } = req.body;

    try {
        const newExpense = await Expense.create({ value, category, description });
        res.status(201).json({ message: 'Despesa registrada com sucesso!', newExpense });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar despesa.', error });
    }
});

export default router;