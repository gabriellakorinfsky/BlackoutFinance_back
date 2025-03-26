import express from "express";
import { Income } from "../models/income.js";
const router = express.Router();

// Rota para adicionar despesa
router.post('/addIncome', async (req, res) => {
    const { value, category, description } = req.body;

    try {
        const newIncome = await Income.create({ value, category, description });
        res.status(201).json({ message: 'Entrada registrada com sucesso!', newExpense });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar entrada.', error });
    }
});

export default router;