import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './user.js';

const Expense = sequelize.define("Expense", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    data: {
        type: DataTypes.DATE,
        allowNull: false
    }
    
});

Expense.belongsTo(User, { foreignKey: 'user_Id'}); // Um gasto pertence a um usuário
User.hasMany(Expense, { foreignKey: 'user_Id' }); // Um usuário pode ter vários gastos

export { Expense };