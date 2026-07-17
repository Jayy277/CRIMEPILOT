const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Evidence = sequelize.define('Evidence', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  evidenceId: {
    type: DataTypes.STRING(30),
    unique: true,
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  collectionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  assignedOfficerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'officers', key: 'id' },
  },
  linkedCrimeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'crimes', key: 'id' },
  },
  filePath: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
}, {
  tableName: 'evidence',
  hooks: {
    // Auto-generate evidenceId before create (e.g. EV-2026-00001)
    beforeCreate: async (ev) => {
      if (!ev.evidenceId) {
        const year = ev.collectionDate
          ? new Date(ev.collectionDate).getFullYear()
          : new Date().getFullYear();
        const count = await Evidence.count();
        ev.evidenceId = `EV-${year}-${String(count + 1).padStart(5, '0')}`;
      }
    },
  },
});

module.exports = Evidence;
