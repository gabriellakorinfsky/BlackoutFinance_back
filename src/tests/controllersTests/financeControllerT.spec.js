import { calculateTotals, financeTotals } from "../../controllers/financeController.js";
import { Income } from "../../models/income";
import { Expense } from "../../models/expense.js";

// Mock das funções do Sequelize sum
jest.mock('../../models/income.js');
jest.mock('../../models/expense.js');


describe('calculateTotals', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('deve calcular corretamente os totais financeiros', async () => {
        Income.sum.mockResolvedValue(500);
        Expense.sum.mockResolvedValue(300);

        const result = await calculateTotals(1);

        expect(result).toEqual({
            totalIncome: 500,
            totalExpenses: 300,
            saldoAtual:200
        });
        expect(Income.sum).toHaveBeenCalledWith('value', { where: { user_Id: 1 } });
        expect(Expense.sum).toHaveBeenCalledWith('value', { where: { user_Id: 1 } });
    });

    test('deve retornar 0 se valores forem nulos', async () => {
        Income.sum.mockResolvedValue(null);
        Expense.sum.mockResolvedValue(null);

        const result = await calculateTotals(2);

        expect(result).toEqual({
            totalIncome: 0,
            totalExpenses: 0,
            saldoAtual: 0
        });
    });
});

describe('financeTotals controller', () => {
    let req, res;

    beforeEach(() => {
        req = { userId: 1 };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test('deve responder com os totais financeiros com sucesso', async () => {
        Income.sum.mockResolvedValue(1000);
        Expense.sum.mockResolvedValue(400);

        await financeTotals(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            totalIncome: 1000,
            totalExpenses: 400,
            saldoAtual: 600
        });
    });

    test('deve lidar com erro e retornar status 500', async () => {
        Income.sum.mockRejectedValue(new Error('Erro simulado'));

        await financeTotals(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro ao obter totais.',
            error: 'Erro simulado'
        });
    });
});