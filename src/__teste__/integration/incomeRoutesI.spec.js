import request from 'supertest';
import app from '../../../app.js'; // app criado no app.js
import { createIncome, getAllIncomes } from '../../controllers/incomeController.js';
import { authenticate } from '../../middleware/authMiddleware.js';

// Mock do middleware de autenticação para evitar necessidade de JWT real
jest.mock('../../middleware/authMiddleware.js', () => ({
    authenticate: (req, res, next) => next()
}));

// Mock dos controllers se você quiser apenas testar o fluxo até eles
jest.mock('../../controllers/incomeController.js', () => ({
    createIncome: jest.fn((req, res) => res.status(201).json({ message: "Entrada criada com sucesso" })),
    getAllIncomes: jest.fn((req, res) => res.status(200).json([{ id: 1, valor: 100 }])),
    updateIncome: jest.fn((req, res) => res.status(200).json({ message: "Entrada atualizada" })),
    deleteIncome: jest.fn((req, res) => res.status(200).json({ message: "Entrada excluída" })),
}));

describe('Testes de Integração - Income Routes', () => {
    test('POST /api/income/create deve criar uma entrada', async () => {
        const res = await request(app)
        .post('/api/income/create')
        .send({ valor: 100 });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Entrada criada com sucesso');
    });

    test('GET /api/income deve retornar todas as entradas', async () => {
        const res = await request(app).get('/api/income');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].valor).toBe(100);
    });

    test('PUT /api/income/:id - deve atualizar uma entrada', async () => {
        const response = await request(app)
        .put('/api/income/1')
        .send({ valor: 200 });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Entrada atualizada");
    });

    test('DELETE /api/income/:id - deve excluir uma entrada', async () => {
        const response = await request(app).delete('/api/income/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Entrada excluída");
    });
});
