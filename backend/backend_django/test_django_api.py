import subprocess
import time
import sys
import os
import urllib.request
import json

PORT = 5002
BASE_URL = f"http://127.0.0.1:{PORT}/api"

def log(msg):
  print(f"[TEST RUNNER] {msg}")

def err(msg):
  print(f"[TEST RUNNER ERROR] {msg}")

def request(path, method='GET', data=None, headers=None):
  url = f"{BASE_URL}{path}"
  req_headers = {'Content-Type': 'application/json'}
  if headers:
    req_headers.update(headers)
    
  req_data = json.dumps(data).encode('utf-8') if data else None
  req = urllib.request.Request(url, data=req_data, headers=req_headers, method=method)
  
  try:
    with urllib.request.urlopen(req) as response:
      res_data = json.loads(response.read().decode('utf-8'))
      return response.status, res_data
  except urllib.error.HTTPError as e:
    try:
      res_data = json.loads(e.read().decode('utf-8'))
      return e.code, res_data
    except Exception:
      return e.code, {'message': e.reason}
  except Exception as e:
    return 500, {'message': str(e)}

def run_tests():
  server_proc = None
  try:
    # 1. Run Seed DB
    log("Seeding database...")
    subprocess.run([sys.executable, 'manage.py', 'seed_db'], check=True)
    log("Database seeded successfully.")

    # 2. Boot server on port 5002
    log("Starting Django REST Framework server on port 5002...")
    server_proc = subprocess.Popen(
      [sys.executable, 'manage.py', 'runserver', str(PORT)],
      stdout=subprocess.DEVNULL,
      stderr=subprocess.DEVNULL
    )
    time.sleep(3.5) # Wait for Django to boot
    log("Server ready.")

    # Shared details
    admin_token = ""
    officer_token = ""
    category_id = None
    location_id = None
    officer_profile_id = None
    crime_id_1 = None
    crime_id_2 = None

    # Test 1: Admin login
    log("Test 1: Admin Login...")
    status_code, res = request('/auth/login', 'POST', {
      'usernameOrEmail': 'admin@crimepilot.com',
      'password': 'admin@1234'
    })
    
    if status_code != 200 or 'token' not in res:
      raise Exception(f"Admin login failed: {res}")
    admin_token = res['token']
    log("Admin login successful.")

    # Test 2: Fetch Categories
    log("Test 2: Fetching Categories...")
    status_code, res = request('/admin/crime-categories', 'GET', headers={'Authorization': f"Bearer {admin_token}"})
    if status_code != 200 or not res.get('categories'):
      raise Exception("Failed to fetch crime categories")
    category_id = res['categories'][0]['id']
    log(f"Category fetched: {res['categories'][0]['name']} (ID: {category_id})")

    # Test 3: Custom Feature A: Fetch Legal Sections
    log("Test 3: Fetching legal sections for category...")
    status_code, res = request(f"/crime-categories/{category_id}/sections", 'GET', headers={'Authorization': f"Bearer {admin_token}"})
    if status_code != 200 or not res.get('sections'):
      raise Exception("Failed to fetch legal sections")
    log(f"Custom Feature A: Found {len(res['sections'])} legal sections.")

    # Test 4: Fetch Locations
    log("Test 4: Fetching Locations...")
    status_code, res = request('/admin/locations', 'GET', headers={'Authorization': f"Bearer {admin_token}"})
    if status_code != 200 or not res.get('locations'):
      raise Exception("Failed to fetch locations")
    location_id = res['locations'][0]['id']
    log(f"Location fetched: {res['locations'][0]['policeStation']} (ID: {location_id})")

    # Test 5: Admin registers a new police officer
    log("Test 5: Creating a Police Officer user...")
    status_code, res = request('/auth/signup', 'POST', headers={'Authorization': f"Bearer {admin_token}"}, data={
      'name': 'Officer Django',
      'email': f'officer.django.{int(time.time())}@crimepilot.com',
      'password': 'Officer@123',
      'role': 'officer',
      'badgeNo': f"BADGE-{int(time.time()) % 10000}",
      'station': location_id,
      'contact': '9876543210'
    })
    if status_code != 201:
      raise Exception(f"Failed to create officer: {res}")
    officer_email = res['user']['email']
    officer_profile_id = res['details']['id']
    log(f"Officer registered: {officer_email} Profile ID: {officer_profile_id}")

    # Test 6: Officer Login
    log("Test 6: Logging in as created Officer...")
    status_code, res = request('/auth/login', 'POST', data={
      'usernameOrEmail': officer_email,
      'password': 'Officer@123'
    })
    if status_code != 200:
      raise Exception("Officer login failed")
    officer_token = res['token']
    log("Officer login successful.")

    # Test 7: Register Crime Case 1
    log("Test 7: Registering Crime Case 1...")
    status_code, res = request('/crimes', 'POST', headers={'Authorization': f"Bearer {officer_token}"}, data={
      'crimeCategory': category_id,
      'date': '2026-07-02',
      'time': '12:00',
      'location': location_id,
      'description': 'Office laptops and money stolen from safe.',
      'officer': officer_profile_id,
      'priority': 'High',
      'sections': [{'act': 'BNS', 'section': '305', 'description': 'Theft'}]
    })
    if status_code != 201:
      raise Exception(f"Failed to register crime: {res}")
    crime_id_1 = res['crime']['id']
    crime_case_id = res['crime']['crimeId']
    log(f"Crime Case 1 created: {crime_case_id} (ID: {crime_id_1})")

    # Test 8: Register Crime Case 2
    log("Test 8: Registering Crime Case 2...")
    status_code, res = request('/crimes', 'POST', headers={'Authorization': f"Bearer {officer_token}"}, data={
      'crimeCategory': category_id,
      'date': '2026-07-02',
      'time': '16:00',
      'location': location_id,
      'description': 'Laptop theft reported from workstation. CCTV shows entry through back gate.',
      'officer': officer_profile_id,
      'priority': 'Medium'
    })
    if status_code != 201:
      raise Exception("Failed to register Crime Case 2")
    crime_id_2 = res['crime']['id']
    log("Crime Case 2 created.")

    # Test 9: Suspect creation & case linking
    log("Test 9: Creating Suspect Profile linked to Case 1...")
    status_code, res = request('/suspects', 'POST', headers={'Authorization': f"Bearer {officer_token}"}, data={
      'name': 'Python Burglar',
      'age': 29,
      'gender': 'Male',
      'address': '55 Code Lane, Bangalore',
      'status': 'Suspect',
      'linkedCrime': crime_id_1
    })
    if status_code != 201:
      raise Exception(f"Suspect creation failed: {res}")
    suspect_id = res['suspect']['id']
    log("Suspect created.")

    # Test 9b: Re-sync verify previousCases
    log("Test 9b: Creating same Suspect Profile linked to Case 2...")
    status_code, res = request('/suspects', 'POST', headers={'Authorization': f"Bearer {officer_token}"}, data={
      'name': 'Python Burglar', # same name
      'age': 29,
      'gender': 'Male',
      'address': '55 Code Lane, Bangalore',
      'status': 'Arrested',
      'linkedCrime': crime_id_2
    })
    # Verify suspect 2 populated with previousCases
    status_code, res = request(f"/suspects/{res['suspect']['id']}", 'GET', headers={'Authorization': f"Bearer {officer_token}"})
    if not res.get('suspect') or not res['suspect']['previousCases']:
      raise Exception("Suspect previousCases sync mapping failed")
    log(f"Suspect updated. Previous Cases matched: {[c['crimeId'] for c in res['suspect']['previousCases']]}")

    # Test 10: Status Progression checks
    log("Test 10: Testing Status Progression validation...")
    log("Trying to skip to 'Solved' directly...")
    status_code, res = request(f"/crimes/{crime_id_1}/status", 'PATCH', headers={'Authorization': f"Bearer {officer_token}"}, data={
      'status': 'Solved'
    })
    if status_code == 400:
      log("Validation working: skipping was blocked with 400 Bad Request.")
    else:
      raise Exception(f"Status skip validation was not enforced: {status_code}")

    log("Updating to correct next status: 'Assigned'...")
    status_code, res = request(f"/crimes/{crime_id_1}/status", 'PATCH', headers={'Authorization': f"Bearer {officer_token}"}, data={
      'status': 'Assigned'
    })
    if status_code == 200 and res.get('status') == 'Assigned':
      log("Status updated successfully to 'Assigned'.")
    else:
      raise Exception(f"Correct status progression failed: {res}")

    # Test 11: Add notes
    log("Test 11: Adding investigation note to Case 1...")
    status_code, res = request(f"/crimes/{crime_id_1}/notes", 'POST', headers={'Authorization': f"Bearer {officer_token}"}, data={
      'note': 'Verified burglar details.'
    })
    if status_code != 200:
      raise Exception("Note adding failed")
    log("Note added successfully.")

    # Test 12: Check Pending Cases
    log("Test 12: Verifying Custom Feature B: Pending cases endpoint...")
    status_code, res = request('/crimes/pending', 'GET', headers={'Authorization': f"Bearer {officer_token}"})
    if status_code != 200 or not any(c['id'] == crime_id_1 for c in res.get('crimes', [])):
      raise Exception("Pending cases list failed")
    log("Custom Feature B verified: case list and flags working.")

    # Test 13: Similar Case Finder
    log("Test 13: Verifying Custom Feature C: Similar Case Finder...")
    status_code, res = request(f"/crimes/{crime_id_1}/similar", 'GET', headers={'Authorization': f"Bearer {officer_token}"})
    if status_code != 200 or not res.get('results'):
      raise Exception("Similar cases search failed")
    match = res['results'][0]
    log(f"Custom Feature C matched related case: {match['crime']['crimeId']}")
    log(f"- Similarity Score: {match['similarityScore']}")
    log(f"- Similarity Reasons: {'; '.join(match['similarityReasons'])}")

    # Test 14: Check Notifications
    log("Test 14: Verifying Notifications were created...")
    status_code, res = request('/notifications', 'GET', headers={'Authorization': f"Bearer {officer_token}"})
    if status_code != 200 or not res.get('notifications'):
      raise Exception("Notifications retrieval failed")
    log(f"Retrieved {res['count']} notifications. Latest Alert: {res['notifications'][0]['message']}")

    # Test 15: Check Dashboards
    log("Test 15: Verifying Dashboards stats...")
    status_code, res = request('/dashboard/officer', 'GET', headers={'Authorization': f"Bearer {officer_token}"})
    if status_code != 200 or res['stats']['totalAssigned'] != 2:
      raise Exception("Officer Dashboard count failed")
      
    status_code, res = request('/dashboard/analyst', 'GET', headers={'Authorization': f"Bearer {admin_token}"})
    if status_code != 200 or res['summary']['totalCrimes'] != 9:
      raise Exception("Analyst Dashboard total failed")
    
    log("All 15 integration checks passed successfully for Django!")
    
  except Exception as e:
    err(f"Test run failed: {str(e)}")
    cleanup(server_proc)
    sys.exit(1)
    
  cleanup(server_proc)
  sys.exit(0)

def cleanup(proc):
  if proc:
    log("Stopping Django server...")
    proc.terminate()
    proc.wait()

if __name__ == '__main__':
  run_tests()
