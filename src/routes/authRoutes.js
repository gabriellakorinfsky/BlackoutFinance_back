import express from "express";
import { register, login } from "../controllers/authController.js";
const router = express.Router();

// Essa rota é usada para cadastrar um novo usuário
router.post('/register', register);

// Essa rota é usada para autenticar o usuário e retornar um token JWT
router.post('/login', login);

export default router;