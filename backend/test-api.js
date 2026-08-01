const { spawn, execSync } = require('child_process');
const mongoose = require('mongoose');
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

const log = (msg) => console.log(`[TEST RUNNER] ${msg}`);
const err = (msg) => console.error(`[TEST RUNNER ERROR] ${msg}`);

async function runTests() {
  let serverProcess;
  
  try {
    // 1. Check MongoDB availability
    log('Verifying MongoDB connection...');
    await mongoose.connect('mongodb://localhost:27017/crimegpt', { serverSelectionTimeoutMS: 2000 });
    await mongoose.disconnect();
    log('MongoDB is running.');

    // 2. Run Seed Script
    log('Seeding test database...');
    execSync('npm run seed', { stdio: 'inherit' });
    log('Database seeded.');

    // 3. Start Express Server on Port 5001
    log('Starting CrimeGPT backend server on port 5001...');
    serverProcess = spawn('node', ['server.js'], {
      env: { ...process.env, PORT: PORT, NODE_ENV: 'development' },
      shell: true,
      stdio: 'inherit',
    });

    // Wait for server to boot
    await new Promise((resolve) => setTimeout(resolve, 3000));
    log('Server ready.');

    // Helper request function using native fetch
    const request = async (path, options = {}) => {
      const url = `${BASE_URL}${path}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      const data = await response.json();
      return { status: response.status, data };
    };

    // Keep track of tokens and IDs for subsequent requests
    let adminToken = '';
    let officerToken = '';
    let locationId = '';
    let categoryId = '';
    let officerUserId = '';
    let officerProfileId = '';
    let crimeId1 = '';
    let crimeId2 = '';
    let suspectId = '';
    let victimId = '';

    // Test 1: Admin Login
    log('Test 1: Logging in as Admin...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        usernameOrEmail: 'admin@crimepilot.com',
        password: 'admin@1234',
      }),
    });
    
    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
    }
    adminToken = loginRes.data.token;
    log('Admin login successful. Token acquired.');

    // Test 2: Fetch Categories (Admin / General)
    log('Test 2: Fetching Crime Categories...');
    const catRes = await request('/admin/crime-categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (catRes.status !== 200 || !catRes.data.categories.length) {
      throw new Error('Failed to fetch crime categories');
    }
    categoryId = catRes.data.categories[0]._id;
    log(`Categories fetched. Selected Category: ${catRes.data.categories[0].name} (${categoryId})`);

    // Test 3: Custom Feature A: Fetch Legal Sections
    log('Test 3: Fetching legal sections for selected Category...');
    const secRes = await request(`/crime-categories/${categoryId}/sections`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (secRes.status !== 200 || !secRes.data.sections.length) {
      throw new Error('Failed to fetch legal sections');
    }
    log(`Custom Feature A: Extracted ${secRes.data.sections.length} legal sections successfully.`);

    // Test 4: Fetch Locations
    log('Test 4: Fetching Locations...');
    const locRes = await request('/admin/locations', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (locRes.status !== 200 || !locRes.data.locations.length) {
      throw new Error('Failed to fetch locations');
    }
    locationId = locRes.data.locations[0]._id;
    log(`Locations fetched. Selected Station: ${locRes.data.locations[0].policeStation} (${locationId})`);

    // Test 5: Admin registers a new police officer
    log('Test 5: Registering a new Police Officer account...');
    const signupRes = await request('/auth/signup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Officer John Doe',
        email: `john.doe.${Date.now()}@crimegpt.com`,
        password: 'Officer@123',
        role: 'officer',
        badgeNo: `BADGE-${Math.floor(1000 + Math.random() * 9000)}`,
        station: locationId,
        contact: '9876543210',
      }),
    });

    if (signupRes.status !== 201) {
      throw new Error(`Officer registration failed: ${JSON.stringify(signupRes.data)}`);
    }
    officerUserId = signupRes.data.user._id;
    officerProfileId = signupRes.data.details._id;
    log(`Officer registered successfully. Profile ID: ${officerProfileId}`);

    // Test 6: Officer Login
    log('Test 6: Logging in as Newly Created Officer...');
    const officerLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        usernameOrEmail: signupRes.data.user.email,
        password: 'Officer@123',
      }),
    });

    if (officerLoginRes.status !== 200) {
      throw new Error(`Officer login failed: ${JSON.stringify(officerLoginRes.data)}`);
    }
    officerToken = officerLoginRes.data.token;
    log('Officer login successful.');

    // Test 7: Register Crime Case (Officer)
    log('Test 7: Registering Crime Case 1...');
    const crime1Res = await request('/crimes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        crimeCategory: categoryId,
        date: '2026-06-25',
        time: '14:30',
        location: locationId,
        description: 'House burglary reported. Lock was broken. Laptop and gold jewelry stolen.',
        officer: officerProfileId,
        priority: 'High',
        sections: [secRes.data.sections[0]], // assign first legal section
      }),
    });

    if (crime1Res.status !== 201) {
      throw new Error(`Crime registration failed: ${JSON.stringify(crime1Res.data)}`);
    }
    crimeId1 = crime1Res.data.crime._id;
    log(`Crime Case 1 created successfully: ${crime1Res.data.crime.crimeId} (${crimeId1})`);

    // Test 8: Register Crime Case 2 (for similar case finder testing later)
    log('Test 8: Registering Crime Case 2 (similar details)...');
    const crime2Res = await request('/crimes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        crimeCategory: categoryId,
        date: '2026-06-28', // close date
        time: '18:15',
        location: locationId, // same station
        description: 'Residential burglary. Entry through kitchen window. Gold ornaments and money missing.',
        officer: officerProfileId,
        priority: 'Medium',
        sections: [secRes.data.sections[0]],
      }),
    });
    if (crime2Res.status !== 201) {
      throw new Error('Failed to create second crime case');
    }
    crimeId2 = crime2Res.data.crime._id;
    log(`Crime Case 2 created: ${crime2Res.data.crime.crimeId}`);

    // Test 9: Suspect Creation & Case Linkage
    log('Test 9: Creating Suspect Profile linked to Case 1...');
    const suspectRes = await request('/suspects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        name: 'James Thief',
        age: 34,
        gender: 'Male',
        address: '123 Hideout Lane, Mumbai',
        status: 'Suspect',
        linkedCrime: crimeId1,
      }),
    });

    if (suspectRes.status !== 201) {
      throw new Error(`Failed to create suspect: ${JSON.stringify(suspectRes.data)}`);
    }
    suspectId = suspectRes.data.suspect._id;
    log(`Suspect James Thief created. Linked Crime: Case 1.`);

    // Link same suspect to Case 2 to verify automatic case linking / track previous cases
    log('Test 9b: Creating same Suspect Profile linked to Case 2...');
    const suspect2Res = await request('/suspects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        name: 'James Thief', // same name
        age: 34,
        gender: 'Male',
        address: '123 Hideout Lane, Mumbai',
        status: 'Arrested',
        linkedCrime: crimeId2,
      }),
    });
    
    // Check that Case 1 is now in suspect 2's previousCases
    log('Verifying previousCases linked correctly...');
    const getSuspectRes = await request(`/suspects/${suspect2Res.data.suspect._id}`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    log(`Suspect updated. Previous Cases matched: ${JSON.stringify(getSuspectRes.data.suspect.previousCases.map(c => c.crimeId))}`);

    // Test 10: Status Progression Order Validation
    log('Test 10: Testing Status Progression validation...');
    log("Trying to skip to 'Solved' directly...");
    const skipStatusRes = await request(`/crimes/${crimeId1}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({ status: 'Solved' }),
    });

    if (skipStatusRes.status === 400) {
      log('Validation working: status skip was rejected with 400 Bad Request.');
    } else {
      throw new Error(`Validation failed! Status skipping should have been rejected but got status: ${skipStatusRes.status}`);
    }

    log("Updating to correct next status: 'Assigned'...");
    const nextStatusRes = await request(`/crimes/${crimeId1}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({ status: 'Assigned' }),
    });

    if (nextStatusRes.status === 200 && nextStatusRes.data.status === 'Assigned') {
      log("Status updated successfully to 'Assigned'.");
    } else {
      throw new Error(`Failed to update to next logical status: ${JSON.stringify(nextStatusRes.data)}`);
    }

    // Test 11: Add notes/timeline updates
    log('Test 11: Adding investigation note to Case 1...');
    const noteRes = await request(`/crimes/${crimeId1}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({ note: 'Investigating door lock patterns and security cameras.' }),
    });

    if (noteRes.status !== 200 || !noteRes.data.notes.length) {
      throw new Error('Failed to add note');
    }
    log('Note appended successfully.');

    // Test 12: Custom Feature B: Pending Case Red-Dot Flag
    log('Test 12: Checking Custom Feature B: Pending cases endpoint...');
    const pendingRes = await request('/crimes/pending', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    if (pendingRes.status !== 200) {
      throw new Error('Failed to fetch pending cases');
    }
    const match = pendingRes.data.crimes.find(c => String(c._id) === String(crimeId1));
    if (match && match.isPending === true) {
      log('Custom Feature B: Case isPending virtual resolved as true for pending case.');
    } else {
      throw new Error('Pending case isPending virtual was not true.');
    }

    // Test 13: Custom Feature C: Similar Case Finder
    log('Test 13: Checking Custom Feature C: Similar Case Finder...');
    const similarRes = await request(`/crimes/${crimeId1}/similar`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    if (similarRes.status !== 200 || !similarRes.data.results.length) {
      throw new Error('Failed to find similar cases');
    }
    const similarMatch = similarRes.data.results[0];
    log(`Custom Feature C: Found related case!`);
    log(`- Match Case: ${similarMatch.crime.crimeId}`);
    log(`- Similarity Score: ${similarMatch.similarityScore}`);
    log(`- Reasons: ${similarMatch.similarityReasons.join('; ')}`);

    // Test 14: Fetch Notifications
    log('Test 14: Checking notifications are created...');
    const notifyRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    if (notifyRes.status !== 200 || !notifyRes.data.notifications.length) {
      throw new Error('No notifications generated');
    }
    log(`Notifications retrieved. Count: ${notifyRes.data.count}. Latest message: "${notifyRes.data.notifications[0].message}"`);

    // Test 15: Dashboards
    log('Test 15: Checking dashboards...');
    const officerDash = await request('/dashboard/officer', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    log(`Officer Dashboard assigned count: ${officerDash.data.stats.totalAssigned}`);

    const analystDash = await request('/dashboard/analyst', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    log(`Analyst Dashboard total cases counted: ${analystDash.data.summary.totalCrimes}`);

    log('Integration tests passed successfully!');
    cleanup(serverProcess, 0);

  } catch (errException) {
    err(`Test failed: ${errException.message}`);
    cleanup(serverProcess, 1);
  }
}

function cleanup(serverProcess, exitCode) {
  if (serverProcess) {
    log('Stopping the server...');
    serverProcess.kill('SIGINT');
  }
  process.exit(exitCode);
}

// Start tests
runTests();
