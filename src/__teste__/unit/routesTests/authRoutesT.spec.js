import request from 'supertest';
import app from '../../../../app.js'; 
import { register, login } from '../../../controllers/authController.js';

// Mock das funções do controller
jest.mock('../../../controllers/authController.js', () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: "Usuário registrado com sucesso" })),
  login: jest.fn((req, res) => res.status(200).json({ token: "fake-jwt-token" }))
}));

describe('Rotas de autenticação', () => {
    test('POST /api/auth/register - deve retornar status 201 ao registrar', async () => {
        const response = await request(app)
        .post('/api/auth/register')
        .send({ email: "teste@teste.com", password: "123456" });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Usuário registrado com sucesso");
    });

    test('POST /api/auth/login - deve retornar token', async () => {
        const response = await request(app)
        .post('/api/auth/login')
        .send({ email: "teste@teste.com", password: "123456" });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBe("fake-jwt-token");
    });
});