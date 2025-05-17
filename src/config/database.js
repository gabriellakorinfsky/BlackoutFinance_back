import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração da conexão com o banco de dados PostgreSQL
const sequelize = new Sequelize(
    process.env.DB_NAME,      // Nome do banco de dados
    process.env.DB_USER,      // Usuário do banco
    process.env.DB_PASS,      // Senha do banco
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
);
    
export { sequelize };