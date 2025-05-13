import { Expense } from "../models/expense.js";
import { Income } from "../models/income.js";
import { Op } from 'sequelize';


// Rota para adicionar despesa
export async function createExpense (req, res) {
    const { value, category, description, data} = req.body;
    const userId = req.userId;

    // Verifica se o userId existe
    if (!userId) {
        return res.status(400).json({ message: 'Usuário não autenticado.' });
    }
    try {
       // Calcular total de entradas
        const totalIncome = await Income.sum('value', { where: { user_Id: userId } }) || 0;
        console.log('Total de entradas:', totalIncome);  // Log para depuração

        // Calcular total de despesas
        const totalExpense = await Expense.sum('value', { where: { user_Id: userId } }) || 0;
        console.log('Total de despesas:', totalExpense);

        // Calcular saldo atual
        const saldoAtual = totalIncome - totalExpense;
        console.log('Saldo atual disponível:', saldoAtual);  // Log para depuração

        // Verificar se há saldo suficiente
        if (value > saldoAtual) {
            return res.status(400).json({ message: 'Saldo insuficiente para essa despesa.' });
        }

        // Se saldo suficiente, cria a despesa
        const newExpense = await Expense.create({ value, category, description, data, user_Id: userId });
        
        res.status(201).json({ message: 'Despesa registrada com sucesso!', newExpense });
    } catch (error) {
        console.error('Erro ao criar despesa:', error);
        res.status(500).json({ message: 'Erro ao registrar despesa.', error: error.message });
    }
};

// Função para listar todas as despesas de um usuário
export async function getAllExpenses(req, res) {
    const userId = req.userId;  // Recuperando o ID do usuário do middleware de autenticação

    try {
        // Buscar todas as despesas associadas ao userId
        const newExpense = await Expense.findAll({ where: { user_Id: userId } });
        
        if (!newExpense || newExpense.length === 0) {
            return res.status(404).json({ message: 'Nenhuma despesa encontrada.' });
        }

        res.status(200).json({ newExpense });
    } catch (error) {
        console.error('Erro ao listar despesas:', error);
        res.status(500).json({ message: 'Erro ao listar despesas.', error: error.message });
    }
};

// Função para atualizar uma despesa existente
export async function updateExpense(req, res) {
    const { value, category, description, data } = req.body;
    const expenseId = req.params.id;  // O ID da despesa que queremos atualizar
    const userId = req.userId;  // ID do usuário autenticado

    try {
        // Busca a despesa do usuário
        const existingExpense = await Expense.findOne({ where: { id: expenseId, user_Id: userId } });

        if (!existingExpense) {
            return res.status(404).json({ message: 'Despesa não encontrada ou você não tem permissão para alterá-la.' });
        }

        // Soma entradas e outras despesas (exceto a atual)
        const totalIncome = await Income.sum('value', { where: { user_Id: userId } }) || 0;
        const totalOtherExpenses = await Expense.sum('value', { where: { user_Id: userId, id: { [Op.ne]: expenseId } } }) || 0;
        // id: { [Op.ne]: expenseId } ignora a que está sendo atualizada
        const saldoAtual = totalIncome - totalOtherExpenses;

        if (value > saldoAtual) {
            return res.status(400).json({ message: 'Saldo insuficiente para atualizar esta despesa.' });
        }

        // Atualiza a despesa
        existingExpense.value = value;
        existingExpense.category = category;
        existingExpense.description = description;
        existingExpense.data = data;

        await existingExpense.save();

        res.status(200).json({ message: 'Despesa atualizada com sucesso!', newExpense: existingExpense });

    } catch (error) {
        console.error('Erro ao atualizar despesa:', error);
        res.status(500).json({ message: 'Erro ao atualizar despesa.', error: error.message });
    }
};

// Função para excluir uma despesa
export async function deleteExpense(req, res) {
    const expenseId = req.params.id;  // O ID da despesa que queremos excluir
    const userId = req.userId;  // ID do usuário autenticado

    try {
        // Encontrar a despesa
        const newExpense = await Expense.findOne({ where: { id: expenseId, user_Id: userId } });

        if (!newExpense) {
            return res.status(404).json({ message: 'Despesa não encontrada ou você não tem permissão para excluí-la.' });
        }

        // Deletar a despesa
        await newExpense.destroy();

         // Verificar se ainda há despesas na tabela
        const remaining = await Expense.count();

        if (remaining === 0) {
            // Resetar a sequência de IDs
            await sequelize.query(`ALTER SEQUENCE "Expenses_id_seq" RESTART WITH 1;`);
        }

        res.status(200).json({ message: 'Despesa excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        res.status(500).json({ message: 'Erro ao excluir despesa.', error: error.message });
    }
};
