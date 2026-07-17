const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  policeStation: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
}, {
  tableName: 'locations',
  indexes: [
    {
      unique: true,
      fields: ['state', 'district', 'city', 'policeStation'],
    },
  ],
});

module.exports = Location;
