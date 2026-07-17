const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Officer = sequelize.define('Officer', {
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
  badgeNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  stationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'locations', key: 'id' },
  },
  contact: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
}, {
  tableName: 'officers',
});

module.exports = Officer;
