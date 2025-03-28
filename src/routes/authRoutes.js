import authController from '../controllers/authController.js';
import express from "express";
const router = express.Router();

// Cadastro
router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;