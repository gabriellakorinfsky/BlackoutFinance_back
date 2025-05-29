import request from 'supertest';
import app from '../../../app.js'; // caminho para o seu app.js

// Mock do middleware authenticate para passar direto (sem bloquear)
jest.mock('../../middleware/authMiddleware.js', () => ({
    authenticate: (req, res, next) => {
        req.userId = 1; // simula um usuário autenticado
        next();
    }
}));

// Mock dos controllers para isolar o teste da rota
jest.mock('../../controllers/expenseController.js', () => ({
    createExpense: (req, res) => res.status(201).json({ message: 'Despesa criada' }),
    getAllExpenses: (req, res) => res.status(200).json([{ id: 1, description: 'Teste', value: 100 }]),
    updateExpense: (req, res) => res.status(200).json({ message: 'Despesa atualizada' }),
    deleteExpense: (req, res) => res.status(200).json({ message: 'Despesa excluída' }),
}));

describe('Rotas de despesas', () => {

    test('POST /api/expense/create - deve criar uma despesa e retornar 201', async () => {
        const response = await request(app)
        .post('/api/expense/create')
        .send({ description: 'Teste', value: 100 });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Despesa criada');
    });

    test('GET /api/expense/ - deve retornar todas as despesas com status 200', async () => {
        const response = await request(app).get('/api/expense/');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('description');
    });

    test('PUT /api/expense/:id - deve atualizar uma despesa e retornar 200', async () => {
        const response = await request(app)
        .put('/api/expense/1')
        .send({ description: 'Despesa atualizada', value: 150 });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Despesa atualizada');
    });

    test('DELETE /api/expense/:id - deve excluir uma despesa e retornar 200', async () => {
        const response = await request(app).delete('/api/expense/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Despesa excluída');
    });

});
