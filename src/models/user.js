import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID, // UUID para ID único
        defaultValue: DataTypes.UUIDV4, // Gerar UUID automaticamente
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false, 
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING(11),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, 
        validate: {
            isEmail: true, 
        },
    },
    password: {
        type: DataTypes.STRING(8),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
    },
});
  
export { User };