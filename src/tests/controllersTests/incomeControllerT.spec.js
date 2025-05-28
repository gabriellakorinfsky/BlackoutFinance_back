import { createIncome, getAllIncomes, updateIncome, deleteIncome } from '../../controllers/incomeController.js';
import { Income } from '../../models/income.js'; // modelo Expense
import { calculateTotals } from '../../controllers/financeController.js'; // ou onde estiver sua função calculateTotals
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

// Mock das funções que vão ser usadas internamente
jest.mock('../../models/expense.js', () => {
    const mockExpense = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        sum: jest.fn(),
        count: jest.fn(),
    };

    // mockando a função belongsTo também
    mockExpense.belongsTo = jest.fn();

    return { Expense: mockExpense };
});
// Mock do Income
jest.mock('../../models/Income.js', () => {
    const mockIncome = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        sum: jest.fn(),
        count: jest.fn(),
        belongsTo: jest.fn(),
    };
    return { Income: mockIncome };
});
jest.mock('../../controllers/financeController.js');
jest.mock('../../config/database.js');
jest.mock('../../models/user.js', () => ({
    User: {}
}));

describe('createIncome controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                value: 2000,
                category: 'salario',
                description: 'maio',
                data: '2025/05/27'
            },
            userId: 1
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    test('deve retornar 400 se usuário não estiver autenticado', async () => {
        req.userId = null;

        await createIncome(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não autenticado.' });
    });

    test('deve criar a entrada e retornar 201 com os dados', async () => {
        const mockIncome = {
            id: 1,
            ...req.body,
            user_Id: req.userId
        };

        const mockTotals = {
            totalIncome: 100,
            totalExpenses: 0,
            balance: 100
        };

        Income.create.mockResolvedValue(mockIncome);
        calculateTotals.mockResolvedValue(mockTotals);

        await createIncome(req, res);

        expect(Income.create).toHaveBeenCalledWith({
            ...req.body,
            user_Id: req.userId
        });

        expect(calculateTotals).toHaveBeenCalledWith(req.userId);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Entrada registrada com sucesso!',
            newIncome: mockIncome,
            totals: mockTotals
        });
    });

    test('deve retornar 500 em caso de erro', async () => {
        Income.create.mockRejectedValue(new Error('Erro de banco de dados'));

        await createIncome(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro ao registrar entrada.',
            error: 'Erro de banco de dados'
        });
    });
});
//--------------------------------------------------------------------------------------------------------------------------//
describe('getAllIncomes controller', () => {
    let req, res;

    beforeEach(() => {
        req = { userId: 1 };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    test('deve retornar 200 e uma lista de entrada', async () => {
        const mockData = [{ id: 1, value: 2000 }];
        Income.findAll.mockResolvedValue(mockData);

        await getAllIncomes(req, res);

        expect(Income.findAll).toHaveBeenCalledWith({ where: { user_Id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ newIncome: mockData });
    });

    test('deve retornar 500 se ocorrer erro ao buscar despesas', async () => {
        Income.findAll.mockRejectedValue(new Error('Erro no banco'));

        await getAllIncomes(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro ao listar entradas.',
            error: 'Erro no banco'
        });
    });
});
//--------------------------------------------------------------------------------------------------------------------------//

describe('updateIncome controller', () => {
    let req, res, incomeInstance;

    beforeEach(() => {
        req = {
            params: { id: 1 },
            userId: 1,
            body: {
                value: 200,
                category: 'Freelance',
                description: 'Projeto',
                data: '2025/05/28'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        incomeInstance = {
            id: 1,
            save: jest.fn(),
            value: 100,
            category: 'Old',
            description: 'Old Desc',
            data: '2025/01/01'
        };
    });

    test('deve atualizar a entrada com sucesso', async () => {
        Income.findOne.mockResolvedValue(incomeInstance);
        Income.sum.mockResolvedValue(100);
        calculateTotals.mockResolvedValue({ totalIncome: 300, totalExpenses: 100 });

        await updateIncome(req, res);

        expect(incomeInstance.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Entrada atualizada com sucesso!',
            newIncome: incomeInstance
        }));
    });

    test('deve retornar 404 se a entrada não for encontrada', async () => {
        Income.findOne.mockResolvedValue(null);

        await updateIncome(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Entrada não encontrada.' });
    });

    test('deve retornar 400 se o novo valor for menor que o total de despesas', async () => {
        Income.findOne.mockResolvedValue(incomeInstance);
        Income.sum.mockResolvedValue(50);
        calculateTotals.mockResolvedValue({ totalExpenses: 300 });

        await updateIncome(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Novo valor da entrada deixaria o saldo insuficiente para cobrir as despesas.'
        });
    });

    it('deve retornar 500 em caso de erro interno', async () => {
        Income.findOne.mockRejectedValue(new Error('Erro inesperado'));

        await updateIncome(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao atualizar entrada.',
            error: 'Erro inesperado'
        }));
    });
});
//--------------------------------------------------------------------------------------------------------------------------//
describe('deleteIncome Controller', () => {
    let req, res, incomeInstance;

    beforeEach(() => {
        req = { params: { id: 1 }, userId: 1 };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        incomeInstance = {
            id: 1,
            destroy: jest.fn()
        };
    });

    test('deve excluir a entrada e retornar sucesso', async () => {
        Income.findOne.mockResolvedValue(incomeInstance);
        Income.sum.mockResolvedValue(1000);
        Income.count.mockResolvedValue(0);
        calculateTotals.mockResolvedValue({ totalIncome: 0, totalExpenses: 0 });

        await deleteIncome(req, res);

        expect(incomeInstance.destroy).toHaveBeenCalled();
        expect(sequelize.query).toHaveBeenCalledWith(`ALTER SEQUENCE "Incomes_id_seq" RESTART WITH 1;`);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Entrada excluída com sucesso!'
        }));
    });

    test('deve retornar 404 se a entrada não for encontrada', async () => {
        Income.findOne.mockResolvedValue(null);

        await deleteIncome(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Entrada não encontrada.' });
    });

    test('deve retornar 500 se ocorrer erro interno', async () => {
        Income.findOne.mockRejectedValue(new Error('Erro no banco'));

        await deleteIncome(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro ao excluir entrada.',
            error: 'Erro no banco'
        });
    });
    it('deve retornar 400 se saldo ficar insuficiente após exclusão', async () => {
        Income.findOne.mockResolvedValue(incomeInstance);
        Income.sum.mockResolvedValue(50);
        calculateTotals.mockResolvedValue({ totalExpenses: 100 });

        await deleteIncome(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Excluir esta entrada deixaria o saldo insuficiente para cobrir as despesas.'
        });
    });
});