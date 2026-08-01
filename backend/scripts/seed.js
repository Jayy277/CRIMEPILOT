const dotenv = require('dotenv');
dotenv.config();

const {
  syncDatabase,
  User,
  Location,
  CrimeCategory,
  CrimeCategorySection,
  Officer,
  Analyst,
  Crime,
  CrimeSelectedSection,
  Suspect,
  Victim,
  Evidence,
} = require('../models/index');

const sampleLocations = [
  { state: 'Gujarat',       district: 'Ahmedabad',      city: 'Ahmedabad',  policeStation: 'Satellite Police Station' },
  { state: 'Gujarat',       district: 'Ahmedabad',      city: 'Ahmedabad',  policeStation: 'Navrangpura Police Station' },
  { state: 'Gujarat',       district: 'Surat',          city: 'Surat',      policeStation: 'Varachha Police Station' },
  { state: 'Gujarat',       district: 'Vadodara',       city: 'Vadodara',   policeStation: 'Sayajigunj Police Station' },
  { state: 'Gujarat',       district: 'Gandhinagar',    city: 'Gandhinagar',policeStation: 'Sector 7 Police Station' },
  { state: 'Gujarat',       district: 'Rajkot',         city: 'Rajkot',     policeStation: 'Pradyuman Nagar Police Station' },
  { state: 'Gujarat',       district: 'Bhavnagar',      city: 'Bhavnagar',  policeStation: 'Nilambaug Police Station' },
  { state: 'Gujarat',       district: 'Jamnagar',       city: 'Jamnagar',   policeStation: 'City A Division Police Station' },
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

// Configure 7 Officers with name@123 password format
const sampleOfficerUsers = [
  { email: 'john@crimepilot.com', name: 'Officer John Smith', password: 'john@123', badgeNo: 'BADGE-1001', stationIndex: 0, contact: '9876543210' },
  { email: 'sarah@crimepilot.com', name: 'Officer Sarah Connor', password: 'sarah@123', badgeNo: 'BADGE-1002', stationIndex: 1, contact: '9876543211' },
  { email: 'david@crimepilot.com', name: 'Officer David Miller', password: 'david@123', badgeNo: 'BADGE-1003', stationIndex: 3, contact: '9876543212' },
  { email: 'emily@crimepilot.com', name: 'Officer Emily Watson', password: 'emily@123', badgeNo: 'BADGE-1004', stationIndex: 5, contact: '9876543213' },
  { email: 'james@crimepilot.com', name: 'Officer James Bond', password: 'james@123', badgeNo: 'BADGE-0007', stationIndex: 6, contact: '9870070070' },
  { email: 'robert@crimepilot.com', name: 'Officer Robert Vance', password: 'robert@123', badgeNo: 'BADGE-1008', stationIndex: 2, contact: '9876543214' },
  { email: 'michael@crimepilot.com', name: 'Officer Michael Scott', password: 'michael@123', badgeNo: 'BADGE-1009', stationIndex: 4, contact: '9876543215' }
];

const sampleAnalystUsers = [
  { email: 'carl@crimepilot.com', name: 'Analyst Carl Sagan', password: 'carl@1234', department: 'Cyber Intelligence Unit' },
  { email: 'neha@crimepilot.com', name: 'Analyst Neha Verma', password: 'neha@1234', department: 'Forensic Data Division' },
];

const sampleCrimeCases = [];
const sampleSuspects = [];
const sampleVictims = [];
const sampleEvidence = [];

const categoriesList = ['Theft', 'Robbery', 'Assault', 'Cyber Crime', 'Fraud', 'Missing Person', 'Narcotics', 'Traffic Crime'];
const statuses = ['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved', 'Closed'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

// Programmatically generate 12 cases per officer (total 84 cases) with varying progress/statuses
let caseCounter = 1;
for (let oIdx = 0; oIdx < sampleOfficerUsers.length; oIdx++) {
  const officer = sampleOfficerUsers[oIdx];
  const officerName = officer.name.replace('Officer ', '');

  for (let c = 0; c < 12; c++) {
    const category = categoriesList[(oIdx + c) % categoriesList.length];
    const locationIndex = (oIdx + c) % sampleLocations.length;
    const date = new Date(2026, 4, 1 + (oIdx * 3) + c).toISOString().split('T')[0];
    const time = `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 4) * 15).padStart(2, '0')}`;
    const priority = priorities[(c + oIdx) % priorities.length];
    const status = statuses[(c + oIdx) % statuses.length];

    const description = `Incident of ${category.toLowerCase()} reported inside jurisdiction limits. Handled by Officer ${officerName}. Investigation log updated.`;
    
    // Find matching sections for category
    const catSections = sampleCategories.find(cat => cat.name === category).sections;

    sampleCrimeCases.push({
      category,
      locationIndex,
      officerIndex: oIdx,
      date,
      time,
      description,
      priority,
      status,
      sections: [catSections[0]],
    });

    sampleSuspects.push({
      name: `Suspect ${caseCounter} (${officerName})`,
      age: 21 + (caseCounter % 35),
      gender: caseCounter % 2 === 0 ? 'Male' : 'Female',
      address: `Junction Street ${10 + caseCounter}, ${sampleLocations[locationIndex].city}`,
      status: status === 'Solved' || status === 'Closed' ? 'Arrested' : 'Suspect',
    });

    sampleVictims.push({
      name: `Victim ${caseCounter}`,
      contact: `987654${1000 + caseCounter}`,
      statement: `Reported physical description of incident details on ${date} relating to ${category.toLowerCase()}.`,
      evidenceReference: `Docket-${100 + caseCounter}`,
    });

    sampleEvidence.push({
      type: category === 'Cyber Crime' || category === 'Fraud' ? 'Digital Records' : 'Physical Exhibit',
      description: `Secured item collection relating to the case files.`,
      collectionDate: date,
      filePath: `/uploads/evidence_file_${caseCounter}.jpg`,
    });

    caseCounter++;
  }
}

const seedDB = async () => {
  try {
    await syncDatabase();

    console.log('\n[1/6] Seeding admin user...');
    const adminEmail = 'admin@crimepilot.com';
    const [admin, adminCreated] = await User.findOrCreate({
    // 1. Admin
    const adminEmail = 'admin@crimepilot.com';
    const [adminUser, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
        password: 'admin@1234',
        role: 'admin',
        isActive: true,
      },
    });
    console.log(adminCreated ? '   Admin created.' : '   Admin already exists.');

    console.log('\n[2/6] Seeding locations...');
    const locations = [];
    for (const loc of sampleLocations) {
      const [location] = await Location.findOrCreate({ where: loc, defaults: loc });
      locations.push(location);
    }
    console.log(`   ${locations.length} locations available.`);

    console.log('\n[3/6] Seeding crime categories and sections...');
    const categories = {};
    for (const cat of sampleCategories) {
      const [category, created] = await CrimeCategory.findOrCreate({
        where: { name: cat.name },
        defaults: { name: cat.name },
      });
      categories[cat.name] = category;
      if (created) {
        for (const sec of cat.sections) {
          await CrimeCategorySection.create({ ...sec, categoryId: category.id });
        }
      }
    }
    console.log(`   ${Object.keys(categories).length} categories available.`);

    console.log('\n[4/6] Seeding officers and analysts...');
    const officers = [];
    for (const officerData of sampleOfficerUsers) {
      const [user] = await User.findOrCreate({
        where: { email: officerData.email },
        defaults: {
          name: officerData.name,
          email: officerData.email,
          password: officerData.password,
          role: 'officer',
          isActive: true,
        },
      });
      // Force update password for existing users to name@123 format if they already exist
      user.password = officerData.password;
      await user.save();

      const station = locations[officerData.stationIndex];
      const [officer] = await Officer.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          badgeNo: officerData.badgeNo,
          stationId: station.id,
          contact: officerData.contact,
        },
      });
      officers.push(officer);
    }
    for (const analystData of sampleAnalystUsers) {
      const [user] = await User.findOrCreate({
        where: { email: analystData.email },
        defaults: {
          name: analystData.name,
          email: analystData.email,
          password: analystData.password,
          role: 'analyst',
          isActive: true,
        },
      });
      await Analyst.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          department: analystData.department,
        },
      });
    }
    console.log(`   ${officers.length} officers and ${sampleAnalystUsers.length} analysts seeded.`);

    console.log('\n[5/6] Seeding crime cases, suspects, victims, and evidence...');
    
    // Clear out existing dynamic data to avoid massive clutter on multiple runs
    await Suspect.destroy({ where: {} });
    await Victim.destroy({ where: {} });
    await Evidence.destroy({ where: {} });
    await CrimeSelectedSection.destroy({ where: {} });
    await Crime.destroy({ where: {} });

    const crimes = [];
    for (const crimeData of sampleCrimeCases) {
      const crime = await Crime.create({
        categoryId: categories[crimeData.category].id,
        date: crimeData.date,
        time: crimeData.time,
        locationId: locations[crimeData.locationIndex].id,
        description: crimeData.description,
        officerId: officers[crimeData.officerIndex].id,
        priority: crimeData.priority,
        status: crimeData.status,
      });
      crimes.push(crime);
      for (const section of crimeData.sections) {
        await CrimeSelectedSection.create({
          crimeId: crime.id,
          act: section.act,
          section: section.section,
          description: section.description,
        });
      }
    }

    for (let i = 0; i < crimes.length; i++) {
      const crime = crimes[i];
      await Suspect.create({
        ...sampleSuspects[i],
        linkedCrimeId: crime.id,
      });
      await Victim.create({
        ...sampleVictims[i],
        linkedCrimeId: crime.id,
      });
      await Evidence.create({
        type: sampleEvidence[i].type,
        description: sampleEvidence[i].description,
        collectionDate: sampleEvidence[i].collectionDate,
        assignedOfficerId: officers[i % officers.length].id,
        linkedCrimeId: crime.id,
        filePath: sampleEvidence[i].filePath,
      });
    }
    console.log(`   ${crimes.length} crimes seeded with linked suspects, victims, and evidence.`);

    console.log('\n[6/6] Seeding complete!');

    if (!created) {
      adminUser.password = 'admin@1234';
      await adminUser.save();
    }

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
