const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Analyst = sequelize.define('Analyst', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  department: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
}, {
  tableName: 'analysts',
});

module.exports = Analyst;
