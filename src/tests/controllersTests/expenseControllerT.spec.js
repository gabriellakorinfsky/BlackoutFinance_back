import { createExpense, getAllExpenses, updateExpense, deleteExpense } from '../../controllers/expenseController.js';
import { Expense } from '../../models/expense.js'; // modelo Expense
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

describe('createExpense controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                value: 50,
                category: 'alimentação',
                description: 'Almoço',
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

        await createExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não autenticado.' });
    });

    test('deve retornar 400 se saldo for insuficiente', async () => {
        // Mock do saldoAtual baixo
        calculateTotals.mockResolvedValue({ saldoAtual: 30 });

        await createExpense(req, res);

        expect(calculateTotals).toHaveBeenCalledWith(req.userId);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Saldo insuficiente para essa despesa.' });
    });

    test('deve criar a despesa e retornar 201 com dados', async () => {
        calculateTotals.mockResolvedValueOnce({ saldoAtual: 100 }); // saldo antes
        calculateTotals.mockResolvedValueOnce({ saldoAtual: 50 });  // saldo depois

        const fakeExpense = { id: 1, ...req.body, user_Id: req.userId };
        Expense.create.mockResolvedValue(fakeExpense);

        await createExpense(req, res);

        expect(Expense.create).toHaveBeenCalledWith({
            value: req.body.value,
            category: req.body.category,
            description: req.body.description,
            data: req.body.data,
            user_Id: req.userId
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Despesa registrada com sucesso!',
            newExpense: fakeExpense,
            totals: { saldoAtual: 50 }
        });
    });

    test('deve retornar 500 em caso de erro', async () => {
        calculateTotals.mockRejectedValue(new Error('Erro no cálculo'));
        
        await createExpense(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro ao registrar despesa.',
            error: 'Erro no cálculo'
        });
    });
});
//--------------------------------------------------------------------------------------------------------------------------//
describe('getAllExpenses controller', () => {
    let req, res;

    beforeEach(() => {
        req = { userId: 1 };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    it('deve retornar 200 e uma lista de despesas', async () => {
        const fakeExpenses = [
            { id: 1, value: 100, category: 'alimentação', user_Id: 1 },
            { id: 2, value: 50, category: 'transporte', user_Id: 1 }
        ];

        Expense.findAll.mockResolvedValue(fakeExpenses);

        await getAllExpenses(req, res);

        expect(Expense.findAll).toHaveBeenCalledWith({ where: { user_Id: req.userId } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ newExpense: fakeExpenses });
    });

    it('deve retornar 500 se ocorrer erro ao buscar despesas', async () => {
        Expense.findAll.mockRejectedValue(new Error('Erro no banco'));

        await getAllExpenses(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro ao listar despesas.',
            error: 'Erro no banco'
        });
    });
});
//--------------------------------------------------------------------------------------------------------------------------//

describe('updateExpense controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 1 },
            userId: 123,
            body: {
                value: 80,
                category: 'Transporte',
                description: 'Uber',
                data: '2024-05-27'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('deve atualizar a despesa com sucesso', async () => {
        Expense.findOne.mockResolvedValue({ 
            id: 1,
            user_Id: 123,
            save: jest.fn(),
            value: 50
        });

        calculateTotals.mockResolvedValue({ totalIncome: 500 });
        Expense.sum.mockResolvedValue(400); // totalOtherExpenses

        await updateExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Despesa atualizada com sucesso!',
            newExpense: expect.any(Object),
            totals: expect.any(Object)
        }));
    });

    it('deve retornar 404 se a despesa não for encontrada', async () => {
        Expense.findOne.mockResolvedValue(null);

        await updateExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Despesa não encontrada.' });
    });

    it('deve retornar 400 se o novo valor for maior que o saldo disponível', async () => {
        Expense.findOne.mockResolvedValue({ 
            id: 1,
            user_Id: 123,
            save: jest.fn(),
        });

        calculateTotals.mockResolvedValue({ totalIncome: 300 });
        Expense.sum.mockResolvedValue(280); // saldo = 300 - 280 = 20, e valor = 80

        await updateExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Saldo insuficiente para atualizar esta despesa.' });
    });

    it('deve retornar 500 em caso de erro interno', async () => {
        Expense.findOne.mockRejectedValue(new Error('Erro inesperado'));

        await updateExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao atualizar despesa.',
            error: 'Erro inesperado'
        }));
    });
});
//--------------------------------------------------------------------------------------------------------------------------//
describe('deleteExpense Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: 1 },
            userId: 10
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('deve excluir a despesa e retornar sucesso', async () => {
        const mockExpense = {
            destroy: jest.fn(),
        };

        Expense.findOne.mockResolvedValue(mockExpense);
        Expense.count.mockResolvedValue(0);
        sequelize.query.mockResolvedValue();
        calculateTotals.mockResolvedValue({ saldoAtual: 100 });

        await deleteExpense(req, res);

        expect(Expense.findOne).toHaveBeenCalledWith({ where: { id: 1, user_Id: 10 } });
        expect(mockExpense.destroy).toHaveBeenCalled();
        expect(calculateTotals).toHaveBeenCalledWith(10);
        expect(sequelize.query).toHaveBeenCalledWith(`ALTER SEQUENCE "Expenses_id_seq" RESTART WITH 1;`);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Despesa excluída com sucesso!',
            totals: { saldoAtual: 100 }
        });
    });

    it('deve retornar 404 se a despesa não for encontrada', async () => {
        Expense.findOne.mockResolvedValue(null);

        await deleteExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Despesa não encontrada.' });
    });

    it('deve retornar 500 se ocorrer erro interno', async () => {
        Expense.findOne.mockRejectedValue(new Error('Erro no banco'));

        await deleteExpense(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro ao excluir despesa.',
            error: 'Erro no banco'
        });
    });
});