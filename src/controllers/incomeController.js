import { Income } from "../models/income.js";
import { calculateTotals } from "./financeController.js";
import { sequelize } from "../config/database.js";
import { Op } from 'sequelize';

// Função para adicionar entrada
export async function createIncome (req, res) {
    const { value, category, description, data } = req.body;
    const userId = req.userId;

    // Verifica se o usuario existe
    if (!userId) {
        return res.status(400).json({ message: 'Usuário não autenticado.' });
    }

    try {
        // Cria nova entrada de renda associada ao usuário
        const newIncome = await Income.create({ value, category, description, data, user_Id: userId});

        // Atualiza os totais após criação
        const updateTotal = await calculateTotals(userId);
        
        res.status(201).json({ message: 'Entrada registrada com sucesso!', newIncome, totals: updateTotal });
    } catch (error) {
        console.error('Erro ao criar entrada:', error);
        res.status(500).json({ message: 'Erro ao registrar entrada.', error: error.message });
    }
};

// Função para listar todas as entradas de um usuário
export async function getAllIncomes(req, res) {
    const userId = req.userId;  

    try {
        // Buscar todas as entradas associadas ao usuário
        const newIncome = await Income.findAll({ where: { user_Id: userId } });

        res.status(200).json({ newIncome });
    } catch (error) {
        console.error('Erro ao listar entradas:', error);
        res.status(500).json({ message: 'Erro ao listar entradas.', error: error.message });
    }
};

// Função para atualizar uma entrada existente
export async function updateIncome(req, res) {
    const { value, category, description, data } = req.body;
    const incomeId = req.params.id;  
    const userId = req.userId;  

    try {
        // Busca a entrada que será atualizada e valida se pertence ao usuário
        const newIncome = await Income.findOne({ where: { id: incomeId, user_Id: userId } });

        if (!newIncome) {
            return res.status(404).json({ message: 'Entrada não encontrada.' });
        }

        // Obtém o total de despesas
        const { totalExpenses } = await calculateTotals(userId);

        // Soma todas as outras entradas, exceto a atual
        const otherIncomes = await Income.sum('value', {where: {user_Id: userId, id: { [Op.ne]: incomeId }} }) || 0;

        // Novo total de entradas após atualização
        const saldoAtual = otherIncomes + value;

        // Verifica se o novo total de entradas cobre as despesas
        if (saldoAtual < totalExpenses) {
            return res.status(400).json({message: 'Novo valor da entrada deixaria o saldo insuficiente para cobrir as despesas.'});
        }

        // Atualizar a entrada
        newIncome.value = value;
        newIncome.category = category;
        newIncome.description = description;
        newIncome.data = data;

        await newIncome.save(); 

        const updateTotal = await calculateTotals(userId);

        res.status(200).json({ message: 'Entrada atualizada com sucesso!', newIncome, totals: updateTotal });
    } catch (error) {
        console.error('Erro ao atualizar entrada:', error);
        res.status(500).json({ message: 'Erro ao atualizar entrada.', error: error.message });
    }
};

// Função para excluir uma entrada
export async function deleteIncome(req, res) {
    const userId = req.userId;  
    const incomeId = req.params.id;
    try {
        // Verifica se a entrada existe e pertence ao usuário
        const newIncome = await Income.findOne({ where: { id: incomeId, user_Id: userId } });

        if (!newIncome) {
            return res.status(404).json({ message: 'Entrada não encontrada.' });
        }

        // Obtém os totais antes da exclusão
        const { totalExpenses } = await calculateTotals(userId);

        const otherIncomes = await Income.sum('value', {where: {user_Id: userId, id: { [Op.ne]: incomeId }} }) || 0;

        // Verificar se após excluir ainda haverá saldo suficiente
        if (otherIncomes < totalExpenses) {
            return res.status(400).json({message: 'Excluir esta entrada deixaria o saldo insuficiente para cobrir as despesas.'});
        }

        // Excluir a entrada
        await newIncome.destroy({ where: { id: incomeId } });

        const updateTotal = await calculateTotals(userId);

        // Se não houver mais entradas, reinicia a sequência de IDs no banco de dados
        const remaining = await Income.count({ where: { user_Id: userId } });

        if (remaining === 0) {
            await sequelize.query(`ALTER SEQUENCE "Incomes_id_seq" RESTART WITH 1;`);
        }

        res.status(200).json({ message: 'Entrada excluída com sucesso!', totals: updateTotal });
    } catch (error) {
        console.error('Erro ao excluir entrada:', error);
        res.status(500).json({ message: 'Erro ao excluir entrada.', error: error.message });
    }
    
};
