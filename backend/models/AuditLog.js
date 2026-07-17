const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,   // null for anonymous pre-auth attempts
    references: { model: 'users', key: 'id' },
    onDelete: 'SET NULL',
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'audit_logs',
  timestamps: false,   // we manage timestamp manually via the 'timestamp' column
});

module.exports = AuditLog;
