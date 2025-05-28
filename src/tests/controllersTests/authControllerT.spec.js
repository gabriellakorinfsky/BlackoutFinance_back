// Describe - bloco de teste - tests suites
// IT or Test - declara unico teste unitario - tests case
// Expect - asserções do resultado - validar resultados

//Import para Teste do register
import { register } from '../../controllers/authController.js';
//Import para Teste do login
import { login } from '../../controllers/authController.js';
import jwt from 'jsonwebtoken';

//Import para testes pros 2
import { User } from '../../models/user.js';
import bcrypt from 'bcrypt';

// Mock dos métodos usados
jest.mock('../../models/user.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe("Auth Controller about register", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                name: "Teste",
                dateOfBirth: "06/06/2002",
                phoneNumber: "81999999999",
                email: "teste@gmail.com",
                password: "12345678"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    })

    test('deve cadastrar um novo usuário se o e-mail não estiver em uso', async () => {
        User.findOne.mockResolvedValue(null); // E-mail não existe
        bcrypt.hash.mockResolvedValue('senha_criptografada'); // Senha criptografada
        User.create.mockResolvedValue({ id: 1 }); // Usuário criado

        await register(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
        expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
        expect(User.create).toHaveBeenCalledWith({
            name: req.body.name,
            dateOfBirth: req.body.dateOfBirth,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            password: 'senha_criptografada'
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuário registrado com sucesso.' });
    });

    test('deve retornar 400 se o e-mail já estiver cadastrado', async () => {
        User.findOne.mockResolvedValue({ id: 1 }); // E-mail já existe

        await register(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'E-mail já cadastrado.' });
    });

    test('deve retornar 500 se ocorrer erro interno', async () => {
        User.findOne.mockRejectedValue(new Error('Erro de banco'));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro ao registrar usuário.' }));
    });
});

describe('Auth Controller about login', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    test('deve retornar 404 se usuário não for encontrado', async () => {
        req.body = { email: 'teste@teste.com', password: '123456' };
        User.findOne.mockResolvedValue(null);  // mocka sem encontrar usuário

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado.' });
    });

    test('deve retornar 401 se senha estiver incorreta', async () => {
        req.body = { email: 'teste@teste.com', password: 'senhaerrada' };
        User.findOne.mockResolvedValue({ password: 'hashqualquer' }); // encontrou usuário
        bcrypt.compare.mockResolvedValue(false); // senha errada

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Senha incorreta.' });
    });

    test('deve retornar token se login for bem sucedido', async () => {
        req.body = { email: 'teste@teste.com', password: 'senha123' };
        const userMock = { id: 1, password: 'hashsenha' };
        User.findOne.mockResolvedValue(userMock);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token-mockado');

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Login bem-sucedido!',
            token: 'token-mockado',
            email: 'teste@teste.com',
        });
    });

    test('deve retornar 500 em caso de erro', async () => {
        req.body = { email: 'teste@teste.com', password: 'senha123' };
        User.findOne.mockRejectedValue(new Error('Erro inesperado'));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro no login',
            error: 'Erro inesperado'
        }));
    });
});