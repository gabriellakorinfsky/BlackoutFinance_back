import request from 'supertest';
import app from '../../../app.js';  // seu app Express principal

// Mock do middleware authenticate para passar direto
jest.mock('../../middleware/authMiddleware.js', () => ({
  authenticate: (req, res, next) => next(),
}));

// Mock dos controllers de expense
jest.mock('../../controllers/expenseController.js', () => ({
    createExpense: (req, res) => res.status(201).json({ message: "Despesa criada com sucesso" }),
    getAllExpenses: (req, res) => res.status(200).json([
        { id: 1, description: "Despesa 1", amount: 100 },
        { id: 2, description: "Despesa 2", amount: 200 }
    ]),
    updateExpense: (req, res) => res.status(200).json({ message: "Despesa atualizada com sucesso" }),
    deleteExpense: (req, res) => res.status(204).send()
}));

describe('Teste integração - expenseRoutes', () => {
    test('POST /api/expense/create - deve criar uma despesa', async () => {
        const response = await request(app)
        .post('/api/expense/create')
        .send({ description: "Nova despesa", amount: 150 });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Despesa criada com sucesso");
    });

    test('GET /api/expense - deve retornar todas as despesas', async () => {
        const response = await request(app)
        .get('/api/expense');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('PUT /api/expense/:id - deve atualizar uma despesa', async () => {
        const response = await request(app)
        .put('/api/expense/1')
        .send({ description: "Despesa atualizada", amount: 250 });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Despesa atualizada com sucesso");
    });

    test('DELETE /api/expense/:id - deve deletar uma despesa', async () => {
        const response = await request(app)
        .delete('/api/expense/1');
        expect(response.statusCode).toBe(204);
    });
});
