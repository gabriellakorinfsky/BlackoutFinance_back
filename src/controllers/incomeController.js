import { Income } from "../models/income.js";

// Rota para adicionar entrada
exports.createIncome = async (req, res) => {
    const { value, category, description } = req.body;

    try {
        const newIncome = await Income.create({ value, category, description });
        res.status(201).json({ message: 'Entrada registrada com sucesso!', newIncome });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar entrada.', error });
    }
};

// Buscar todas as entradas
exports.getAllIncomes = async (req, res) => {
    try {
        const incomes = await Income.findAll();
        res.status(200).json(incomes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar despesas', error });
    }
};