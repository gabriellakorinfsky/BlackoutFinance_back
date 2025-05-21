import { Expense } from "../models/expense.js";
import { calculateTotals } from "./financeController.js";
import { sequelize } from "../config/database.js";
import { Op } from 'sequelize';

// Função para adicionar uma nova despesa
export async function createExpense (req, res) {
    const { value, category, description, data} = req.body;
    const userId = req.userId;

    // Verifica se o usuario existe
    if (!userId) {
        return res.status(400).json({ message: 'Usuário não autenticado.' });
    }

    try {
       const { saldoAtual } = await calculateTotals(userId);

        // Verifica se o saldo é suficiente para registrar a nova despesa
        if (value > saldoAtual) {
            return res.status(400).json({ message: 'Saldo insuficiente para essa despesa.' });
        }

        // Se saldo suficiente, cria a despesa
        const newExpense = await Expense.create({ value, category, description, data, user_Id: userId });
        
        // Atualiza os totais após criação
        const updateTotal = await calculateTotals(userId);
        
        res.status(201).json({ message: 'Despesa registrada com sucesso!', newExpense: newExpense, totals: updateTotal });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar despesa.', error: error.message });
    }
};

// Função para listar todas as despesas de um usuário
export async function getAllExpenses(req, res) {
    const userId = req.userId;  

    try {
        // Buscar todas as despesas associadas ao usuario
        const newExpense = await Expense.findAll({ where: { user_Id: userId } });

        res.status(200).json({ newExpense });
    } catch (error) {
        console.error('Erro ao listar despesas:', error);
        res.status(500).json({ message: 'Erro ao listar despesas.', error: error.message });
    }
};

// Função para atualizar uma despesa existente
export async function updateExpense(req, res) {
    const { value, category, description, data } = req.body;
    const expenseId = req.params.id;  
    const userId = req.userId;  

    try {
        // Verifica se a despesa pertence ao usuário
        const existingExpense = await Expense.findOne({ where: { id: expenseId, user_Id: userId } });

        if (!existingExpense) {
            return res.status(404).json({ message: 'Despesa não encontrada.' });
        }

        // Calcula o saldo ignorando a despesa que será atualizada
        const { totalIncome } = await calculateTotals(userId);
        
        const totalOtherExpenses = await Expense.sum('value', { where: { user_Id: userId, id: { [Op.ne]: expenseId } } }) || 0;
        // id: { [Op.ne]: expenseId } ignora a que está sendo atualizada
        const saldoAtual = totalIncome - totalOtherExpenses;

        // Verifica se o novo valor da despesa é maior que o saldo disponível
        if (value > saldoAtual) {
            return res.status(400).json({ message: 'Saldo insuficiente para atualizar esta despesa.' });
        }

        // Atualiza os campos da despesa
        existingExpense.value = value;
        existingExpense.category = category;
        existingExpense.description = description;
        existingExpense.data = data;
        await existingExpense.save();

        const updateTotal = await calculateTotals(userId);

        res.status(200).json({ message: 'Despesa atualizada com sucesso!', newExpense: existingExpense, totals: updateTotal });

    } catch (error) {
        console.error('Erro ao atualizar despesa:', error);
        res.status(500).json({ message: 'Erro ao atualizar despesa.', error: error.message });
    }
};

// Função para excluir uma despesa
export async function deleteExpense(req, res) {
    const expenseId = req.params.id;  
    const userId = req.userId;  

    try {
        // Verifica se a despesa existe e pertence ao usuário
        const newExpense = await Expense.findOne({ where: { id: expenseId, user_Id: userId } });

        if (!newExpense) {
            return res.status(404).json({ message: 'Despesa não encontrada.' });
        }

        // Deletar a despesa
        await newExpense.destroy({ where: { id: expenseId } });

        // Atualiza os totais após exclusão
        const updateTotal = await calculateTotals(userId);

        // Se não houver mais despesas, reinicia a sequência de IDs no banco de dados
        const remaining = await Expense.count({ where: { user_Id: userId } });

        if (remaining === 0) {
            // Resetar a sequência de IDs
            await sequelize.query(`ALTER SEQUENCE "Expenses_id_seq" RESTART WITH 1;`);
        }

        res.status(200).json({ message: 'Despesa excluída com sucesso!', totals: updateTotal});
    } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        res.status(500).json({ message: 'Erro ao excluir despesa.', error: error.message });
    }
};
