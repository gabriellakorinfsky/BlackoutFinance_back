import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração da conexão com o banco de dados PostgreSQL
const sequelize = new Sequelize({
    dialect: 'postgres', 
    host: process.env.DB_HOST,    
    username: process.env.DB_USER,     
    password: process.env.DB_PASS, 
    database: process.env.DB_NAME,
    logging: false, 

});
    
export { sequelize };