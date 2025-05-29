import express from "express";
import authRoutes from "./src/routes/authRoutes";
import expenseRoutes from "./src/routes/expenseRoutes.js";
import incomeRoutes from "./src/routes/incomeRoutes.js";
import financeRoutes from "./src/routes/financeRoutes.js";

const app = express();

app.use(express.json());

// Registro das rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/finance", financeRoutes);


export default app;