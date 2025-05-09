import { sequelize } from "./src/config/database.js";
import authRoutes from "./src/routes/authRoutes.js";
import expenseRoutes from "./src/routes/expenseRoutes.js";
import incomeRoutes from "./src/routes/incomeRoutes.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

//  Rotas
app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/income", incomeRoutes);

// Função para conectar ao banco e iniciar o servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados bem-sucedida!");

    // Cria/atualiza tabelas se necessário
    await sequelize.sync(); 
    console.log("Banco de dados sincronizado!");

    const PORT = 5000; //const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
};

// Iniciar o servidor
startServer();
