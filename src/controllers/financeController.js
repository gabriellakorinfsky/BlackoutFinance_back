import { Income } from "../models/income.js";
import { Expense } from '../models/expense.js';

// Função que calcula os totais financeiros de um usuário
export async function calculateTotals(userId) {

    // Soma o total de entradas
    const totalIncome = await Income.sum('value', { where: { user_Id: userId } }) || 0;

    // Soma o total de despesas
    const totalExpenses = await Expense.sum('value', { where: { user_Id: userId } }) || 0;

     // Calcula o saldo atual (entradas - despesas)
    const saldoAtual = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, saldoAtual };
};

// Função para retornar os totais financeiros de um usuário autenticado
export async function financeTotals(req, res) {
    const userId = req.userId;

    try {
        // Chama a função que calcula os totais
        const totals = await calculateTotals(userId);

        // Retorna os totais como resposta
        res.status(200).json(totals);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter totais.', error: error.message });
    }
};

export default calculateTotals;