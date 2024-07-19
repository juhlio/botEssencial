const Sequelize = require('sequelize');
const database = require('../db');

const categories = database.define('budget_requests', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    clientId: Sequelize.INTEGER,
    equipId: Sequelize.INTEGER,
    typeId: Sequelize.INTEGER,
    type: Sequelize.STRING,
    created_by: Sequelize.STRING,
    departament: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
}, {
    timestamps: true, // Adiciona created_at e updated_at
    createdAt: 'created_at', // Personaliza o nome do campo created_at (opcional)
    updatedAt: 'updated_at' // Personaliza o nome do campo updated_at (opcional)
});

module.exports = categories;
