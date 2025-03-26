import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from '../models/user.js';
const router = express.Router();


// Cadastro
router.post("/register", async (req, res) => {
    const { name, dateOfBirth, phoneNumber, email, password } = req.body;

    // Verificar se o email está cadastrado
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
    return res.status(400).json({ message: "E-mail já cadastrado."});
    }

    // Criptografar a senha
   const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o novo usuário
    try {
        const newUser = await User.create({ name, dateOfBirth, phoneNumber, email, password: hashedPassword });
        res.status(201).json({ message: 'Usuário registrado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    //  Verificar se usuário está no banco de dados
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    
    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Senha incorreta.' });
  
    const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '2h' });
    res.status(200).json({ message: 'Login bem-sucedido!', token });
});

export default router;