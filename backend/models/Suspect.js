const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Suspect ↔ Crime is many-to-many (previousCases)
// We create a join table for that relationship

const Suspect = sequelize.define('Suspect', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  photoPath: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('Suspect', 'Detained', 'Arrested', 'Released'),
    defaultValue: 'Suspect',
  },
  linkedCrimeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'crimes', key: 'id' },
  },
}, {
  tableName: 'suspects',
});

// Join table for previousCases (many suspects ↔ many crimes)
const SuspectPreviousCase = sequelize.define('SuspectPreviousCase', {
  suspectId: {
    type: DataTypes.INTEGER,
    references: { model: 'suspects', key: 'id' },
    onDelete: 'CASCADE',
  },
  crimeId: {
    type: DataTypes.INTEGER,
    references: { model: 'crimes', key: 'id' },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'suspect_previous_cases',
  timestamps: false,
});

module.exports = { Suspect, SuspectPreviousCase };
