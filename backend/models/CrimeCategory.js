const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Sections table (replaces nested sectionSchema array)
const CrimeCategorySection = sequelize.define('CrimeCategorySection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'crime_categories', key: 'id' },
    onDelete: 'CASCADE',
  },
  act: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'crime_category_sections',
});

const CrimeCategory = sequelize.define('CrimeCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'crime_categories',
});

// Associations
CrimeCategory.hasMany(CrimeCategorySection, { foreignKey: 'categoryId', as: 'sections' });
CrimeCategorySection.belongsTo(CrimeCategory, { foreignKey: 'categoryId' });

module.exports = { CrimeCategory, CrimeCategorySection };
