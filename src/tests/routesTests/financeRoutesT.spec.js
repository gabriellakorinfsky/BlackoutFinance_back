import request from 'supertest';
import app from '../../../app.js'; // ajuste o caminho conforme necessário

// Mock do middleware de autenticação
jest.mock('../../middleware/authMiddleware.js', () => ({
    authenticate: (req, res, next) => {
        req.userId = 1; // Simula um usuário autenticado
        next();
    }
}));

// Mock do controller de totais financeiros
jest.mock('../../controllers/financeController.js', () => ({
    financeTotals: (req, res) => {
        return res.status(200).json({
            totalIncomes: 5000,
            totalExpenses: 2000,
            balance: 3000
        });
    }
}));

describe('Rota de totais financeiros', () => {
    test('GET /api/finance - deve retornar totais financeiros com status 200', async () => {
        const response = await request(app).get('/api/finance');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            totalIncomes: 5000,
            totalExpenses: 2000,
            balance: 3000
        });
    });
});
