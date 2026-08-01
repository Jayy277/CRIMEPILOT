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
      where: { email: adminEmail },
      defaults: {
        name: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
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
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
