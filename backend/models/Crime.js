const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Crime Notes table (replaces embedded noteSchema array)
const CrimeNote = sequelize.define('CrimeNote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  crimeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'crimes', key: 'id' },
    onDelete: 'CASCADE',
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  addedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'crime_notes',
});

// Crime Selected Sections (replaces embedded selectedSectionSchema array)
const CrimeSelectedSection = sequelize.define('CrimeSelectedSection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  crimeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'crimes', key: 'id' },
    onDelete: 'CASCADE',
  },
  act: { type: DataTypes.STRING(100) },
  section: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'crime_selected_sections',
});

const Crime = sequelize.define('Crime', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  crimeId: {
    type: DataTypes.STRING(30),
    unique: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'crime_categories', key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'locations', key: 'id' },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  officerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'officers', key: 'id' },
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved', 'Closed'),
    defaultValue: 'Reported',
  },
}, {
  tableName: 'crimes',
  hooks: {
    // Auto-generate crimeId before create (e.g. CR-2026-00001)
    beforeCreate: async (crime) => {
      if (!crime.crimeId) {
        const year = crime.date ? new Date(crime.date).getFullYear() : new Date().getFullYear();
        const count = await Crime.count({
          where: sequelize.where(
            sequelize.fn('YEAR', sequelize.col('date')),
            year
          ),
        });
        crime.crimeId = `CR-${year}-${String(count + 1).padStart(5, '0')}`;
      }
    },
  },
});

// Associations
Crime.hasMany(CrimeNote,            { foreignKey: 'crimeId', as: 'notes' });
Crime.hasMany(CrimeSelectedSection, { foreignKey: 'crimeId', as: 'sections' });
CrimeNote.belongsTo(Crime,            { foreignKey: 'crimeId' });
CrimeSelectedSection.belongsTo(Crime, { foreignKey: 'crimeId' });

module.exports = { Crime, CrimeNote, CrimeSelectedSection };
