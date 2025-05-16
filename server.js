import { sequelize } from "./src/config/database.js";
import authRoutes from "./src/routes/authRoutes.js";
import expenseRoutes from "./src/routes/expenseRoutes.js";
import incomeRoutes from "./src/routes/incomeRoutes.js";
import financeRoutes from "./src/routes/financeRoutes.js";

import express from "express";
import cors from "cors";

const app = express();

// Middleware para permitir requisições de diferentes origens (CORS) e interpretar JSON
app.use(cors());
app.use(express.json());

// Registro das rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/finance", financeRoutes);

// Função para iniciar a conexão com o banco e subir o servidor
const startServer = async () => {
  try {
    // Testa a conexão com o banco
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados bem-sucedida!");

    // Garante que as tabelas estejam atualizadas
    await sequelize.sync(); 
    console.log("Banco de dados sincronizado!");

    const PORT = 5000; 
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
};

// Inicializa o app
startServer();
