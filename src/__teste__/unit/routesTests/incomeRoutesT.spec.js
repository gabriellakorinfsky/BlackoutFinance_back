import request from 'supertest';
import app from '../../../../app.js'; // Caminho para seu app.js

// Mock do middleware para pular autenticação
jest.mock('../../../middleware/authMiddleware.js', () => ({
    authenticate: (req, res, next) => {
        req.userId = 1; // Simula usuário autenticado
        next();
    }
}));

// Mock dos controllers de entrada de receita
jest.mock('../../../controllers/incomeController.js', () => ({
    createIncome: (req, res) => res.status(201).json({ message: 'Entrada criada' }),
    getAllIncomes: (req, res) => res.status(200).json([{ id: 1, description: 'Salário', value: 2500 }]),
    updateIncome: (req, res) => res.status(200).json({ message: 'Entrada atualizada' }),
    deleteIncome: (req, res) => res.status(200).json({ message: 'Entrada excluída' }),
}));

describe('Rotas de entradas de receita', () => {

    test('POST /api/income/create - deve criar uma entrada e retornar 201', async () => {
        const response = await request(app)
        .post('/api/income/create')
        .send({ description: 'Salário', value: 2500 });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Entrada criada');
    });

    test('GET /api/income/ - deve retornar todas as entradas com status 200', async () => {
        const response = await request(app).get('/api/income/');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('description');
    });

    test('PUT /api/income/:id - deve atualizar uma entrada e retornar 200', async () => {
        const response = await request(app)
        .put('/api/income/1')
        .send({ description: 'Salário atualizado', value: 2700 });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Entrada atualizada');
    });

    test('DELETE /api/income/:id - deve excluir uma entrada e retornar 200', async () => {
        const response = await request(app).delete('/api/income/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Entrada excluída');
    });

});
