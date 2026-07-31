const dotenv = require('dotenv');
dotenv.config();

const { syncDatabase, User, Location, CrimeCategory } = require('../models/index');

const multiCityLocations = [
  // Ahmedabad
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Ahmedabad City Police Headquarters' },
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Navrangpura Police Station' },
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Satellite Police Station' },
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Vastrapur Police Station' },
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Maninagar Police Station' },
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Sabarmati Police Station' },
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Paldi Police Station' },
  { state: 'Gujarat', district: 'Ahmedabad', city: 'Ahmedabad', policeStation: 'Sarkhej Police Station' },

  // Rajkot
  { state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', policeStation: 'Rajkot City A Division Police Station' },
  { state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', policeStation: 'Rajkot B Division Police Station' },
  { state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', policeStation: 'University Police Station' },
  { state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', policeStation: 'Gandhigram Police Station' },
  { state: 'Gujarat', district: 'Rajkot', city: 'Rajkot', policeStation: 'Pradyuman Nagar Police Station' },

  // Gandhinagar
  { state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', policeStation: 'Gandhinagar Sector 7 Police Station' },
  { state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', policeStation: 'Gandhinagar Sector 21 Police Station' },
  { state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', policeStation: 'Infocity Police Station' },
  { state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', policeStation: 'Chiloda Police Station' },
  { state: 'Gujarat', district: 'Gandhinagar', city: 'Gandhinagar', policeStation: 'Adalaj Police Station' }
];

const sampleCategories = [
  { name: 'Cyber Crime' },
  { name: 'Online Fraud' },
  { name: 'Financial Fraud' },
  { name: 'Mobile Theft' },
  { name: 'Vehicle Theft' },
  { name: 'House Burglary' },
  { name: 'Missing Person' },
  { name: 'Domestic Violence' },
  { name: 'Chain Snatching' },
  { name: 'Public Assault' },
  { name: 'Property Damage' },
  { name: 'Drug Related' },
  { name: 'Traffic Hit & Run' },
  { name: 'Robbery' },
  { name: 'Suspicious Activity' }
];

const seedDB = async () => {
  try {
    await syncDatabase();

    // 1. Admin
    const adminEmail = 'admin@crimepilot.com';
    await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      },
    });

    // 2. Locations
    for (const loc of multiCityLocations) {
      await Location.findOrCreate({ where: { policeStation: loc.policeStation }, defaults: loc });
    }

    // 3. Categories
    for (const cat of sampleCategories) {
      await CrimeCategory.findOrCreate({ where: { name: cat.name }, defaults: { name: cat.name } });
    }

    console.log('Seeded multi-city locations (Ahmedabad, Rajkot, Gandhinagar) and categories into MongoDB model layer.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
