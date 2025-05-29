import request from 'supertest';
import app from '../../../app.js';

// Mocka o middleware de autenticação para sempre passar
jest.mock('../../middleware/authMiddleware.js', () => ({
    authenticate: (req, res, next) => next()
}));

// Mocka o controller
jest.mock('../../controllers/financeController.js', () => ({
    financeTotals: (req, res) => {
        return res.status(200).json({
            totalIncome: 1000,
            totalExpense: 400,
            balance: 600
        });
    }
}));

describe('Teste de integração - financeRoutes', () => {
    test('GET /api/finance - deve retornar os totais financeiros', async () => {
        const response = await request(app).get('/api/finance');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            totalIncome: 1000,
            totalExpense: 400,
            balance: 600
        });
    });
});
