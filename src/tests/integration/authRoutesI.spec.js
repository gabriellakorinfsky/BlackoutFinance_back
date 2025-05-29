import request from 'supertest';
import app from '../../../app.js'; // Certifique-se de que o app importa e usa authRoutes corretamente

// Mocka os controllers
jest.mock('../../controllers/authController.js', () => ({
    register: (req, res) => res.status(201).json({ message: "Usuário registrado com sucesso" }),
    login: (req, res) => res.status(200).json({ token: "fake-jwt-token" })
}));

describe('Teste de integração - authRoutes', () => {
    test('POST /api/auth/register - deve registrar um usuário', async () => {
        const response = await request(app)
        .post('/api/auth/register')
        .send({ email: "usuario@teste.com", password: "123456" });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Usuário registrado com sucesso");
    });

    test('POST /api/auth/login - deve fazer login e retornar token', async () => {
        const response = await request(app)
        .post('/api/auth/login')
        .send({ email: "usuario@teste.com", password: "123456" });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBe("fake-jwt-token");
    });
});
