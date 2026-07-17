const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Victim = sequelize.define('Victim', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  statement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  evidenceReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  linkedCrimeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'crimes', key: 'id' },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'victims',
});

module.exports = Victim;
