const dotenv = require('dotenv');
dotenv.config();

const { syncDatabase, User, Location, CrimeCategory, CrimeCategorySection } = require('../models/index');

const sampleLocations = [
  { state: 'Gujarat',       district: 'Ahmedabad',      city: 'Ahmedabad',  policeStation: 'Satellite Police Station' },
  { state: 'Gujarat',       district: 'Ahmedabad',      city: 'Ahmedabad',  policeStation: 'Navrangpura Police Station' },
  { state: 'Maharashtra',   district: 'Mumbai City',    city: 'Mumbai',     policeStation: 'Colaba Police Station' },
  { state: 'Maharashtra',   district: 'Mumbai Suburban', city: 'Mumbai',    policeStation: 'Andheri Police Station' },
  { state: 'Delhi',         district: 'New Delhi',      city: 'New Delhi',  policeStation: 'Connaught Place Police Station' },
  { state: 'Karnataka',     district: 'Bengaluru Urban', city: 'Bengaluru', policeStation: 'Koramangala Police Station' },
  { state: 'Karnataka',     district: 'Bengaluru Urban', city: 'Bengaluru', policeStation: 'Indiranagar Police Station' },
  { state: 'Rajasthan',     district: 'Jaipur',         city: 'Jaipur',     policeStation: 'Malviya Nagar Police Station' },
  { state: 'Uttar Pradesh', district: 'Lucknow',        city: 'Lucknow',    policeStation: 'Hazratganj Police Station' },
  { state: 'West Bengal',   district: 'Kolkata',        city: 'Kolkata',    policeStation: 'Park Street Police Station' },
];

const sampleCategories = [
  {
    name: 'Theft',
    sections: [
      { act: 'BNS', section: '305', description: 'Theft in a dwelling house, etc.' },
      { act: 'BNS', section: '306', description: 'Theft by clerk or servant of property in possession of master' },
      { act: 'BNS', section: '307', description: 'Theft after preparation made for causing death, hurt or restraint' },
    ],
  },
  {
    name: 'Robbery',
    sections: [
      { act: 'BNS', section: '309', description: 'Robbery and punishment for robbery' },
      { act: 'BNS', section: '310', description: 'Dacoity and punishment for dacoity' },
      { act: 'BNS', section: '311', description: 'Robbery, or dacoity, with attempt to cause death or grievous hurt' },
    ],
  },
  {
    name: 'Assault',
    sections: [
      { act: 'BNS', section: '115', description: 'Voluntarily causing hurt' },
      { act: 'BNS', section: '117', description: 'Voluntarily causing grievous hurt' },
      { act: 'BNS', section: '121', description: 'Assault or criminal force to deter public servant from duty' },
    ],
  },
  {
    name: 'Cyber Crime',
    sections: [
      { act: 'BNS',    section: '318',       description: 'Cheating (Online/Impersonation)' },
      { act: 'IT Act', section: '66D',       description: 'Punishment for cheating by personation by using computer resource' },
      { act: 'IT Act', section: '66C',       description: 'Identity theft' },
    ],
  },
  {
    name: 'Fraud',
    sections: [
      { act: 'BNS', section: '316', description: 'Criminal breach of trust' },
      { act: 'BNS', section: '318', description: 'Cheating and dishonestly inducing delivery of property' },
      { act: 'BNS', section: '336', description: 'Forgery and punishment for forgery' },
    ],
  },
  {
    name: 'Missing Person',
    sections: [
      { act: 'BNSS', section: '84',  description: 'Proclamation for person absconding / missing query' },
      { act: 'BNS',  section: '140', description: 'Kidnapping or abducting in order to murder' },
    ],
  },
  {
    name: 'Narcotics',
    sections: [
      { act: 'NDPS Act', section: '15', description: 'Punishment for contravention in relation to poppy straw' },
      { act: 'NDPS Act', section: '20', description: 'Punishment for contravention in relation to cannabis plant and cannabis' },
      { act: 'NDPS Act', section: '22', description: 'Punishment for contravention in relation to psychotropic substances' },
    ],
  },
  {
    name: 'Traffic Crime',
    sections: [
      { act: 'BNS',                section: '281', description: 'Rash driving or riding on a public way' },
      { act: 'BNS',                section: '106', description: 'Causing death by negligence (Hit and Run cases)' },
      { act: 'Motor Vehicles Act', section: '185', description: 'Driving by a drunken person or under the influence of drugs' },
    ],
  },
];

const seedDB = async () => {
  try {
    // Connect + sync all Sequelize tables
    await syncDatabase();

    // ── 1. Admin User ────────────────────────────────────────────────
    console.log('\n[1/3] Seeding admin user...');
    const adminEmail = 'admin@crimepilot.com';
    const [admin, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name:     'System Administrator',
        email:    adminEmail,
        password: 'Admin@123',   // hashed by beforeCreate hook in User.js
        role:     'admin',
        isActive: true,
      },
    });
    if (created) {
      console.log('   Admin created  →  admin@crimepilot.com  /  Admin@123');
    } else {
      console.log('   Admin already exists — skipping.');
    }

    // ── 2. Locations ─────────────────────────────────────────────────
    console.log('\n[2/3] Seeding locations...');
    let locCreated = 0;
    for (const loc of sampleLocations) {
      const [, c] = await Location.findOrCreate({ where: loc, defaults: loc });
      if (c) locCreated++;
    }
    console.log(`   ${locCreated} new locations inserted (${sampleLocations.length - locCreated} already existed).`);

    // ── 3. Crime Categories + Sections ───────────────────────────────
    console.log('\n[3/3] Seeding crime categories...');
    let catCreated = 0;
    for (const cat of sampleCategories) {
      const [category, c] = await CrimeCategory.findOrCreate({
        where:    { name: cat.name },
        defaults: { name: cat.name },
      });
      if (c) {
        catCreated++;
        // Insert sections for this brand-new category
        for (const sec of cat.sections) {
          await CrimeCategorySection.create({ ...sec, categoryId: category.id });
        }
      }
    }
    console.log(`   ${catCreated} new categories inserted (${sampleCategories.length - catCreated} already existed).`);

    console.log('\nDatabase seeding complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
