import { Expense } from "../models/expense.js";

// Rota para adicionar despesa
exports.createExpense = async (req, res) => {
    const { value, category, description } = req.body;

    try {
        const newExpense = await Expense.create({ value, category, description });
        res.status(201).json({ message: 'Despesa registrada com sucesso!', newExpense });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar despesa.', error });
    }
};

// Buscar todas as despesas
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll();
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar despesas', error });
    }
};