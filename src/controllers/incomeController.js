import { Income } from "../models/income.js";

// Rota para adicionar entrada
export async function createIncome (req, res) {
    const { value, category, description, data } = req.body;
    const userId = req.userId;

     // Verifica se o userId existe
    if (!userId) {
        return res.status(400).json({ message: 'Usuário não autenticado.' });
    }
    try {
        const newIncome = await Income.create({ value, category, description, data, user_Id: userId});
        res.status(201).json({ message: 'Entrada registrada com sucesso!', newIncome });
    } catch (error) {
        console.error('Erro ao criar entrada:', error);
        res.status(500).json({ message: 'Erro ao registrar entrada.', error: error.message });
    }
};

// Função para listar todas as entradas de um usuário
export async function getAllIncomes(req, res) {
    const userId = req.userId;  // Recuperando o ID do usuário do middleware de autenticação

    try {
        // Buscar todas as entradas associadas ao userId
        const newIncome = await Income.findAll({ where: { user_Id: userId } });
        
        if (!newIncome || newIncome.length === 0) {
            return res.status(404).json({ message: 'Nenhuma entrada encontrada.' });
        }

        res.status(200).json({ newIncome });
    } catch (error) {
        console.error('Erro ao listar entradas:', error);
        res.status(500).json({ message: 'Erro ao listar entradas.', error: error.message });
    }
};

// Função para atualizar uma entrada existente
export async function updateIncome(req, res) {
    const { value, category, description, data } = req.body;
    const incomeId = req.params.id;  // O ID da entrada que queremos atualizar
    const userId = req.userId;  // ID do usuário autenticado

    try {
        // Encontrar a entrada com o ID fornecido
        const newIncome = await Income.findOne({ where: { id: incomeId, user_Id: userId } });

        if (!newIncome) {
            return res.status(404).json({ message: 'Entrada não encontrada ou você não tem permissão para alterá-la.' });
        }

        // Atualizar a entrada
        newIncome.value = value;
        newIncome.category = category;
        newIncome.description = description;
        newIncome.data = data;

        await newIncome.save();  // Salvar as alterações no banco de dados

        res.status(200).json({ message: 'Entrada atualizada com sucesso!', newIncome });
    } catch (error) {
        console.error('Erro ao atualizar entrada:', error);
        res.status(500).json({ message: 'Erro ao atualizar entrada.', error: error.message });
    }
};

// Função para excluir uma entrada
export async function deleteIncome(req, res) {
    const incomeId = req.params.id;  // O ID da entrada que queremos excluir
    const userId = req.userId;  // ID do usuário autenticado

    try {
        // Encontrar a entrada
        const newIncome = await Income.findOne({ where: { id: incomeId, user_Id: userId } });

        if (!newIncome) {
            return res.status(404).json({ message: 'Entrada não encontrada ou você não tem permissão para excluí-la.' });
        }

        // Deletar a entrada
        await newIncome.destroy();

        res.status(200).json({ message: 'Entrada excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir entrada:', error);
        res.status(500).json({ message: 'Erro ao excluir entrada.', error: error.message });
    }
};
