import { sequelize } from "./src/config/database.js";
import app from "./app.js";

import express from "express";
import cors from "cors";

const app = express();

// Middleware para permitir requisições de diferentes origens (CORS) e interpretar JSON
app.use(cors({
  origin: 'https://blackout-finance-ui.vercel.app', // link do front
  credentials: true }));

// Função para iniciar a conexão com o banco e subir o servidor
const startServer = async () => {
  try {
    // Testa a conexão com o banco
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados bem-sucedida!");

    // Garante que as tabelas estejam atualizadas
    await sequelize.sync(); 
    console.log("Banco de dados sincronizado!");

    const PORT = process.env.PORT || 5000;   
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
};

// Inicializa o app
startServer();
