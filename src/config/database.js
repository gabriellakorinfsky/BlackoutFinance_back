import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

// Conexão com o PostgreSQL
const sequelize = new Sequelize({
    dialect: 'postgres', 
    host: process.env.DB_HOST,    
    username: process.env.DB_USER,     
    password: process.env.DB_PASS, 
    database: process.env.DB_NAME,
    logging: false,  // Habilitar/desabilitar log de queries SQL

});
    
export { sequelize };