import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './user.js';

const Income = sequelize.define("Income", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_Id: { 
        type: DataTypes.UUID, 
        allowNull: false, 
        references: { model: User, key: 'id' } 
    },
    value: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    category: { 
        type: DataTypes.STRING(50), 
        allowNull: false 
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: { 
        type: DataTypes.DATE, 
        allowNull: false
    }
});

Income.belongsTo(User, { foreignKey: 'user_Id' }); // Uma entrada pertence a um usuário
User.hasMany(Income, { foreignKey: 'user_Id' }); // Um usuário pode ter várias entradas

export { Income };