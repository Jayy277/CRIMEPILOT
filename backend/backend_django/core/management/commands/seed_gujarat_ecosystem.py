import random
import datetime
import sys
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.db import transaction, connection, models
from authentication.models import Officer, Analyst, Citizen
from core.models import Location, CrimeCategory, Crime, Evidence, Suspect, Victim

User = get_user_model()

GUJARAT_CITIES = [
    {"city": "Ahmedabad", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "stations": [
        "Navrangpura Police Station", "Satellite Police Station", "Vastrapur Police Station",
        "Bodakdev Police Station", "Ellisbridge Police Station", "Sabarmati Police Station",
        "Maninagar Police Station", "Shahibaug Police Station", "Sola Police Station",
        "Bopal Police Station", "Crime Branch HQ Unit", "Cyber Crime Police Station", "Traffic Police Station A"
    ]},
    {"city": "Surat", "district": "Surat", "lat": 21.1702, "lng": 72.8311, "stations": [
        "Varachha Police Station", "Adajan Police Station", "Athwa Police Station",
        "Katargam Police Station", "Rander Police Station", "Udhna Police Station",
        "Limbayat Police Station", "Vesu Police Station", "Cyber Crime Police Station", "Crime Branch Unit"
    ]},
    {"city": "Vadodara", "district": "Vadodara", "lat": 22.3072, "lng": 73.1812, "stations": [
        "Sayajigunj Police Station", "Alkapuri Police Station", "Gotri Police Station",
        "Akota Police Station", "Karelibaug Police Station", "Raopura Police Station",
        "Makarpura Police Station", "Cyber Crime Police Station"
    ]},
    {"city": "Rajkot", "district": "Rajkot", "lat": 22.3039, "lng": 70.8022, "stations": [
        "University Road Police Station", "Malaviya Nagar Police Station", "Bhaktinagar Police Station",
        "Gandhigram Police Station", "Pradyuman Nagar Police Station", "A Division Police Station",
        "B Division Police Station", "Cyber Crime Police Station"
    ]},
    {"city": "Gandhinagar", "district": "Gandhinagar", "lat": 23.2156, "lng": 72.6369, "stations": [
        "Sector 7 Police Station", "Sector 21 Police Station", "Infocity Police Station",
        "Kudasan Police Station", "Pethapur Police Station", "Chiloda Police Station"
    ]},
    {"city": "Bhavnagar", "district": "Bhavnagar", "lat": 21.7645, "lng": 72.1519, "stations": [
        "Nilambaug Police Station", "Ghogha Circle Police Station", "C Division Police Station",
        "Vartej Police Station", "Panwadi Police Station"
    ]},
    {"city": "Jamnagar", "district": "Jamnagar", "lat": 22.4707, "lng": 70.0577, "stations": [
        "City A Division Police Station", "City B Division Police Station", "Bedi Police Station", "Panchkoshi Police Station"
    ]},
    {"city": "Junagadh", "district": "Junagadh", "lat": 21.5222, "lng": 70.4579, "stations": [
        "A Division Police Station", "B Division Police Station", "Bilkha Police Station", "Joshipura Police Station"
    ]},
    {"city": "Anand", "district": "Anand", "lat": 22.5645, "lng": 72.9289, "stations": [
        "Town Police Station", "Vidyanagar Police Station", "Vassad Police Station"
    ]},
    {"city": "Nadiad", "district": "Kheda", "lat": 22.6916, "lng": 72.8634, "stations": [
        "Town Police Station", "Rural Police Station"
    ]},
    {"city": "Mehsana", "district": "Mehsana", "lat": 23.5880, "lng": 72.3693, "stations": [
        "City A Division Police Station", "City B Division Police Station"
    ]},
    {"city": "Palanpur", "district": "Banaskantha", "lat": 24.1724, "lng": 72.4346, "stations": [
        "City Police Station", "Highway Police Station"
    ]},
    {"city": "Patan", "district": "Patan", "lat": 23.8493, "lng": 72.1266, "stations": [
        "City Police Station", "University Police Station"
    ]},
    {"city": "Morbi", "district": "Morbi", "lat": 22.8173, "lng": 70.8372, "stations": [
        "City A Division Police Station", "City B Division Police Station", "Morbi Taluka Police Station"
    ]},
    {"city": "Porbandar", "district": "Porbandar", "lat": 21.6417, "lng": 69.6293, "stations": [
        "Kamala Baug Police Station", "Kirti Mandir Police Station"
    ]},
    {"city": "Veraval", "district": "Gir Somnath", "lat": 20.9042, "lng": 70.3674, "stations": [
        "Town Police Station", "Somnath Police Station"
    ]},
    {"city": "Amreli", "district": "Amreli", "lat": 21.6032, "lng": 71.2221, "stations": [
        "City Police Station", "Taluka Police Station"
    ]},
    {"city": "Bharuch", "district": "Bharuch", "lat": 21.7051, "lng": 72.9959, "stations": [
        "Station Road Police Station", "Zadeshwar Police Station"
    ]},
    {"city": "Ankleshwar", "district": "Bharuch", "lat": 21.6264, "lng": 73.0152, "stations": [
        "GIDC Police Station", "Town Police Station"
    ]},
    {"city": "Godhra", "district": "Panchmahal", "lat": 22.7780, "lng": 73.6144, "stations": [
        "Town Police Station", "Taluka Police Station"
    ]},
    {"city": "Dahod", "district": "Dahod", "lat": 22.8347, "lng": 74.2564, "stations": [
        "Town Police Station", "Rural Police Station"
    ]},
    {"city": "Valsad", "district": "Valsad", "lat": 20.5992, "lng": 72.9342, "stations": [
        "City Police Station", "Pardi Police Station"
    ]},
    {"city": "Navsari", "district": "Navsari", "lat": 20.9500, "lng": 72.9300, "stations": [
        "Town Police Station", "Jalalpore Police Station"
    ]},
    {"city": "Vapi", "district": "Valsad", "lat": 20.3717, "lng": 72.9067, "stations": [
        "GIDC Police Station", "Town Police Station"
    ]},
    {"city": "Bhuj", "district": "Kutch", "lat": 23.2420, "lng": 69.6669, "stations": [
        "Town Police Station", "B Division Police Station"
    ]},
    {"city": "Gandhidham", "district": "Kutch", "lat": 23.0753, "lng": 70.1337, "stations": [
        "A Division Police Station", "B Division Police Station"
    ]},
    {"city": "Himmatnagar", "district": "Sabarkantha", "lat": 23.5979, "lng": 72.9698, "stations": [
        "Town Police Station", "Rural Police Station"
    ]},
    {"city": "Modasa", "district": "Aravalli", "lat": 23.4635, "lng": 73.3032, "stations": [
        "Town Police Station"
    ]},
    {"city": "Surendranagar", "district": "Surendranagar", "lat": 22.7240, "lng": 71.6360, "stations": [
        "City A Division Police Station", "City B Division Police Station"
    ]},
    {"city": "Botad", "district": "Botad", "lat": 22.1704, "lng": 71.6675, "stations": [
        "Town Police Station"
    ]},
    {"city": "Dwarka", "district": "Devbhumi Dwarka", "lat": 22.2394, "lng": 68.9678, "stations": [
        "Dwarka City Police Station", "Okha Police Station"
    ]}
]

GUJARATI_FIRST_NAMES = [
    "Amit", "Rahul", "Jay", "Nirav", "Parth", "Harsh", "Yash", "Karan", "Dev", "Mihir",
    "Vikram", "Vijay", "Rajesh", "Sanjay", "Deepak", "Manish", "Gaurav", "Pratik", "Hardik",
    "Bhavik", "Ketan", "Chintan", "Jignesh", "Alpesh", "Dharmesh", "Paresh", "Sameer",
    "Tushar", "Anand", "Kishan", "Vatsal", "Dhaval", "Hiren", "Rohan", "Sanket", "Ashish",
    "Siddharth", "Chetan", "Bhavesh", "Jatin", "Biren", "Rakesh", "Saurabh", "Mayur", "Jayan"
]

GUJARATI_LAST_NAMES = [
    "Patel", "Shah", "Mehta", "Joshi", "Trivedi", "Desai", "Prajapati", "Solanki", "Bhatt",
    "Parmar", "Vaghela", "Rathod", "Chaudhary", "Gohil", "Jadeja", "Zala", "Pandya", "Vyas",
    "Raval", "Chauhan", "Modi", "Soni", "Darji", "Gajjar", "Khatri", "Dave", "Thakar", "Shukla"
]

CITIZEN_FIRST_NAMES = [
    "Aarav", "Ananya", "Bhavin", "Chirag", "Dhara", "Divya", "Ekta", "Gautam", "Hetal",
    "Isha", "Janvi", "Kavita", "Komal", "Lalit", "Mahesh", "Neha", "Nilesh", "Pooja",
    "Priya", "Rahul", "Riya", "Rohan", "Sachin", "Sneha", "Sonam", "Suresh", "Swati",
    "Tarun", "Umesh", "Urvi", "Varun", "Vidhi", "Yashvi", "Zalak", "Kashyap", "Tapan"
]

CRIME_CATEGORIES_DATA = [
    {"name": "Mobile Theft", "bns": "BNS Section 303 (Theft)", "bnss": "BNSS Section 173 (FIR)", "bsa": "BSA Section 61 (Electronic Evidence)"},
    {"name": "Vehicle Theft", "bns": "BNS Section 303(2) (Grand Theft)", "bnss": "BNSS Section 176 (Investigation)", "bsa": "BSA Section 63 (CCTV Proof)"},
    {"name": "Cyber Fraud", "bns": "BNS Section 318 (Cheating)", "bnss": "BNSS Section 173", "bsa": "BSA Section 65B (Digital Certificates)"},
    {"name": "ATM Fraud", "bns": "BNS Section 318(4) (Financial Fraud)", "bnss": "BNSS Section 180", "bsa": "BSA Section 62 (Bank Logs)"},
    {"name": "UPI Scam", "bns": "BNS Section 319 (Impersonation)", "bnss": "BNSS Section 175", "bsa": "BSA Section 63 (Tx Receipts)"},
    {"name": "Chain Snatching", "bns": "BNS Section 304 (Snatching)", "bnss": "BNSS Section 183", "bsa": "BSA Section 60 (Eyewitness)"},
    {"name": "Burglary", "bns": "BNS Section 305 (House Trespass)", "bnss": "BNSS Section 176", "bsa": "BSA Section 61 (Forensic Prints)"},
    {"name": "Domestic Violence", "bns": "BNS Section 85 (Cruelty by Relatives)", "bnss": "BNSS Section 184", "bsa": "BSA Section 57 (Medical Report)"},
    {"name": "Missing Person", "bns": "BNS Section 140 (Kidnapping)", "bnss": "BNSS Section 194", "bsa": "BSA Section 59 (Call Detail Record)"},
    {"name": "Hit and Run", "bns": "BNS Section 106(2) (Rash Driving)", "bnss": "BNSS Section 174", "bsa": "BSA Section 63 (Vehicle GPS)"},
    {"name": "Drug Possession", "bns": "BNS Section 274 (Public Health Hazard)", "bnss": "BNSS Section 185", "bsa": "BSA Section 64 (FSL Report)"},
    {"name": "Kidnapping", "bns": "BNS Section 137 (Kidnapping for Ransom)", "bnss": "BNSS Section 187", "bsa": "BSA Section 61 (Telecom Location)"},
    {"name": "Murder", "bns": "BNS Section 103 (Murder)", "bnss": "BNSS Section 183", "bsa": "BSA Section 65 (Autopsy & DNA)"},
    {"name": "Attempt to Murder", "bns": "BNS Section 109 (Attempt to Murder)", "bnss": "BNSS Section 182", "bsa": "BSA Section 60 (Weapons Recovery)"},
    {"name": "Public Assault", "bns": "BNS Section 115 (Voluntarily Causing Hurt)", "bnss": "BNSS Section 173", "bsa": "BSA Section 58 (Hospital MLC)"},
    {"name": "Forgery", "bns": "BNS Section 336 (Forgery of Documents)", "bnss": "BNSS Section 176", "bsa": "BSA Section 61 (Handwriting Expert)"},
    {"name": "Identity Theft", "bns": "BNS Section 319(2) (Impersonation)", "bnss": "BNSS Section 175", "bsa": "BSA Section 65B (Server Logs)"},
    {"name": "Property Dispute", "bns": "BNS Section 329 (Criminal Trespass)", "bnss": "BNSS Section 168", "bsa": "BSA Section 57 (Revenue Records)"},
    {"name": "Financial Fraud", "bns": "BNS Section 316 (Criminal Breach of Trust)", "bnss": "BNSS Section 178", "bsa": "BSA Section 62 (Audit Ledger)"},
    {"name": "Illegal Gambling", "bns": "BNS Section 292 (Public Gambling)", "bnss": "BNSS Section 173", "bsa": "BSA Section 60 (Seizure Memo)"}
]

class Command(BaseCommand):
  help = 'Seeds complete realistic Gujarat Police Ecosystem dataset'

  def handle(self, *args, **kwargs):
    self.stdout.write(self.style.SUCCESS("========================================================="))
    self.stdout.write(self.style.SUCCESS("  HIGH-SPEED GUJARAT POLICE ECOSYSTEM SEEDING FOR CRIMEPILOT"))
    self.stdout.write(self.style.SUCCESS("========================================================="))

    # Step 1: Instant Clean Old Case & Evidence Records via DB Cursor
    self.stdout.write("Cleaning old records...")
    with connection.cursor() as cursor:
      cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
      cursor.execute("DELETE FROM core_victim;")
      cursor.execute("DELETE FROM core_suspect;")
      cursor.execute("DELETE FROM core_evidence;")
      cursor.execute("DELETE FROM core_crime;")
      cursor.execute("DELETE FROM authentication_officer;")
      cursor.execute("DELETE FROM authentication_citizen;")
      cursor.execute("DELETE FROM authentication_customuser WHERE role IN ('officer', 'citizen');")
      cursor.execute("DELETE FROM core_location;")
      cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
    self.stdout.write(self.style.SUCCESS("[OK] Old records cleared instantly"))

    # Step 2: Ensure Admin User
    admin_user = User.objects.filter(email='admin@crimepilot.com').first()
    if not admin_user:
      admin_user = User.objects.create_superuser(
        email='admin@crimepilot.com',
        name='System Administrator',
        password='admin@1234',
        role='admin'
      )
    else:
      admin_user.set_password('admin@1234')
      admin_user.save()

    # Step 3: Ensure 5 Senior Analysts
    analyst_depts = [
      ("Cyber Crime Analytics", "analyst1@crimepilot.com", "analyst111", "Senior Analyst Priya Shah"),
      ("Crime Trends", "analyst2@crimepilot.com", "analyst222", "Senior Analyst Rajesh Mehta"),
      ("Predictive Intelligence", "analyst3@crimepilot.com", "analyst333", "Senior Analyst Hardik Joshi"),
      ("Digital Evidence", "analyst4@crimepilot.com", "analyst444", "Senior Analyst Neha Trivedi"),
      ("Command Intelligence", "analyst5@crimepilot.com", "analyst555", "Senior Analyst Vikram Desai")
    ]

    for dept, email, passw, fullname in analyst_depts:
      a_user = User.objects.filter(email=email).first()
      if not a_user:
        a_user = User.objects.create_user(
          email=email,
          name=fullname,
          password=passw,
          role='analyst'
        )
      else:
        a_user.name = fullname
        a_user.set_password(passw)
        a_user.save()

      analyst_obj, _ = Analyst.objects.get_or_create(user=a_user, defaults={'department': dept})
      analyst_obj.department = dept
      analyst_obj.save()

    self.stdout.write(self.style.SUCCESS("[OK] Ensured 5 Senior Analysts"))

    # Step 4: Create Crime Categories
    category_objs = []
    for cat_info in CRIME_CATEGORIES_DATA:
      sections_data = [
        {"act": "BNS 2023", "section": cat_info["bns"], "description": f"Penal provision for {cat_info['name']}"},
        {"act": "BNSS 2023", "section": cat_info["bnss"], "description": "Procedural compliance & FIR filing"},
        {"act": "BSA 2023", "section": cat_info["bsa"], "description": "Admissibility of digital evidence"}
      ]
      cat_obj, _ = CrimeCategory.objects.get_or_create(
        name=cat_info["name"],
        defaults={'sections': sections_data}
      )
      cat_obj.sections = sections_data
      cat_obj.save()
      category_objs.append(cat_obj)

    self.stdout.write(self.style.SUCCESS(f"[OK] Created/Updated {len(category_objs)} Crime Categories"))

    # Step 5: Create Locations
    locations = []
    for city_data in GUJARAT_CITIES:
      c_name = city_data["city"]
      d_name = city_data["district"]
      for st_name in city_data["stations"]:
        loc = Location.objects.create(
          state="Gujarat",
          district=d_name,
          city=c_name,
          police_station=st_name
        )
        locations.append((loc, city_data["lat"], city_data["lng"]))

    self.stdout.write(self.style.SUCCESS(f"[OK] Created {len(locations)} Police Stations across {len(GUJARAT_CITIES)} Gujarat Cities"))

    # Pre-compute password hashes for ultra-fast instant seeding
    common_officer_hash = make_password("officer@1234")
    common_citizen_hash = make_password("citizen@1234")

    # Step 6: Create Exactly 3 Officers per Police Station
    used_emails = set(User.objects.values_list('email', flat=True))
    max_id = (User.objects.aggregate(models.Max('id'))['id__max'] or 0) + 1
    badge_counter = 1001

    user_instances = []
    officer_instances = []
    officers = []

    for loc, lat, lng in locations:
      for o_idx in range(1, 4): # Exactly 3 officers per station
        fname = random.choice(GUJARATI_FIRST_NAMES)
        lname = random.choice(GUJARATI_LAST_NAMES)
        full_name = f"{fname} {lname}"

        raw_prefix = f"{fname.lower()}{lname.lower()}"
        email = f"{raw_prefix}@crimepilot.com"
        if email in used_emails:
          email = f"{raw_prefix}{badge_counter}@crimepilot.com"
        used_emails.add(email)

        # Standard password for officer: firstnamelastname@1234
        raw_password = f"{raw_prefix}@1234"

        badge_no = f"BADGE-{badge_counter}"
        badge_counter += 1
        phone = f"+91 9825{random.randint(10000, 99999)}"

        u_inst = User(
          id=max_id,
          email=email,
          name=full_name,
          password=common_officer_hash,
          role='officer',
          is_active=True
        )
        user_instances.append(u_inst)

        off_inst = Officer(
          user_id=max_id,
          badge_no=badge_no,
          station=loc,
          contact=phone
        )
        officer_instances.append(off_inst)
        officers.append((off_inst, loc, lat, lng))
        max_id += 1

    User.objects.bulk_create(user_instances)
    created_officers = Officer.objects.bulk_create(officer_instances)
    self.stdout.write(self.style.SUCCESS(f"[OK] Generated {len(created_officers)} Officers (3 for every police station)"))

    # Step 7: Create 350 Citizens
    cit_user_instances = []
    citizen_instances = []
    citizens = []

    for i in range(1, 351):
      fname = random.choice(CITIZEN_FIRST_NAMES)
      lname = random.choice(GUJARATI_LAST_NAMES)
      full_name = f"{fname} {lname}"

      c_city_info = random.choice(GUJARAT_CITIES)
      city_name = c_city_info["city"]

      raw_prefix = f"{fname.lower()}{lname.lower()}"
      email = f"{raw_prefix}@gmail.com"
      c_cnt = 1
      while email in used_emails:
        email = f"{raw_prefix}{c_cnt}@gmail.com"
        c_cnt += 1
      used_emails.add(email)

      raw_password = f"{fname.lower()}@1234"
      mobile = f"9898{random.randint(100000, 999999)}"
      aadhaar = f"{random.randint(1000,9999)} {random.randint(1000,9999)} {random.randint(1000,9999)}"
      gender = random.choice(["Male", "Female"])

      dob_year = random.randint(1975, 2004)
      dob = datetime.date(dob_year, random.randint(1, 12), random.randint(1, 28))

      u_inst = User(
        id=max_id,
        email=email,
        name=full_name,
        password=common_citizen_hash,
        role='citizen',
        is_active=True
      )
      cit_user_instances.append(u_inst)

      cit_inst = Citizen(
        user_id=max_id,
        mobile=mobile,
        dob=dob,
        gender=gender,
        address=f"House No. {random.randint(1,200)}, Sector {random.randint(1,30)}, {city_name}",
        state="Gujarat",
        city=city_name,
        pincode=f"38{random.randint(1000, 9999)}",
        identity_type="Aadhaar Card",
        identity_number=aadhaar,
        status="verified"
      )
      citizen_instances.append(cit_inst)
      citizens.append(cit_inst)
      max_id += 1

    User.objects.bulk_create(cit_user_instances)
    created_citizens = Citizen.objects.bulk_create(citizen_instances)
    self.stdout.write(self.style.SUCCESS(f"[OK] Generated {len(created_citizens)} Citizens"))

    self.stdout.write(self.style.SUCCESS(f"[OK] Generated {len(created_citizens)} Citizens"))

    # Step 8: Create 5 Criminal Cases per Officer using saved DB objects
    self.stdout.write("Generating 5 Criminal Cases per Officer...")
    priorities = ["Low", "Medium", "High", "Critical"]
    statuses = ["Reported", "Assigned", "Under Investigation", "Evidence Collected", "Chargesheet Filed", "Solved", "Closed"]

    start_date = datetime.date(2025, 1, 1)
    end_date = datetime.date.today()

    db_officers = list(Officer.objects.select_related('user', 'station').all())
    db_citizens = list(Citizen.objects.select_related('user').all())
    city_coords = {c["city"]: (c["lat"], c["lng"]) for c in GUJARAT_CITIES}

    crime_instances = []
    case_counter = 1

    for off_obj in db_officers:
      st_loc = off_obj.station
      c_lat_base, c_lng_base = city_coords.get(st_loc.city, (23.0225, 72.5714))

      for c_idx in range(5): # 5 cases per officer
        cat_obj = random.choice(category_objs)
        cit_obj = random.choice(db_citizens)

        random_days = random.randint(0, (end_date - start_date).days)
        c_date = start_date + datetime.timedelta(days=random_days)
        c_time = f"{random.randint(0,23):02d}:{random.randint(0,59):02d}"

        c_lat = c_lat_base + random.uniform(-0.03, 0.03)
        c_lng = c_lng_base + random.uniform(-0.03, 0.03)

        prio = random.choice(priorities)
        stat = random.choice(statuses)

        desc = f"{cat_obj.name} incident reported at {st_loc.police_station}, {st_loc.city}. Complainant {cit_obj.user.name} reported suspicious activity near coordinates ({c_lat:.4f}, {c_lng:.4f}). Immediate response dispatched."
        crime_id = f"CP-2026-{case_counter:05d}"
        case_counter += 1

        c_inst = Crime(
          crime_id=crime_id,
          crime_category=cat_obj,
          date=c_date,
          time=c_time,
          location=st_loc,
          description=desc,
          officer=off_obj,
          citizen=cit_obj,
          priority=prio,
          status=stat,
          sections=cat_obj.sections,
          notes=[
            {
              "note": f"First Responder Officer {off_obj.user.name} assigned to inspect scene.",
              "addedBy_name": off_obj.user.name,
              "created_at": c_date.strftime("%Y-%m-%d")
            }
          ]
        )
        crime_instances.append(c_inst)

    Crime.objects.bulk_create(crime_instances, batch_size=200)

    # Re-query saved Crimes to assign Evidence, Suspect, Victim with valid crime_id PKs
    db_crimes = list(Crime.objects.select_related('officer', 'citizen', 'crime_category', 'location').all())

    evidence_instances = []
    suspect_instances = []
    victim_instances = []
    ev_counter = 1

    for c_obj in db_crimes:
      off_obj = c_obj.officer
      cat_name = c_obj.crime_category.name
      cit_name = c_obj.citizen.user.name if c_obj.citizen else "Complainant"
      cit_mobile = c_obj.citizen.mobile if c_obj.citizen else "9898000000"

      ev_inst = Evidence(
        evidence_id=f"EV-2026-{ev_counter:05d}",
        collection_date=c_obj.date,
        assigned_officer=off_obj,
        linked_crime=c_obj,
        type=f"Digital / Physical {cat_name} Proof",
        description=f"Evidence collected by Officer {off_obj.user.name} at {c_obj.location.police_station}"
      )
      evidence_instances.append(ev_inst)
      ev_counter += 1

      susp_inst = Suspect(
        name=f"Suspect {random.choice(GUJARATI_FIRST_NAMES)} {random.choice(GUJARATI_LAST_NAMES)}",
        age=random.randint(20, 50),
        gender="Male",
        address=f"Area 4, {c_obj.location.city}",
        status=random.choice(["Suspect", "Detained", "Arrested"]),
        linked_crime=c_obj
      )
      suspect_instances.append(susp_inst)

      vic_inst = Victim(
        name=cit_name,
        contact=cit_mobile,
        statement=f"Complainant reported {cat_name} to Officer {off_obj.user.name}",
        linked_crime=c_obj
      )
      victim_instances.append(vic_inst)

    Evidence.objects.bulk_create(evidence_instances, batch_size=200)
    Suspect.objects.bulk_create(suspect_instances, batch_size=200)
    Victim.objects.bulk_create(victim_instances, batch_size=200)

    self.stdout.write(self.style.SUCCESS("========================================================="))
    self.stdout.write(self.style.SUCCESS(f"  GUJARAT POLICE ECOSYSTEM SEEDED SUCCESSFULLY!"))
    self.stdout.write(self.style.SUCCESS(f"  - Cities Covered: {len(GUJARAT_CITIES)} Major Cities"))
    self.stdout.write(self.style.SUCCESS(f"  - Police Stations: {len(locations)}"))
    self.stdout.write(self.style.SUCCESS(f"  - Officers: {len(db_officers)} (Exactly 3 per Station)"))
    self.stdout.write(self.style.SUCCESS(f"  - Citizens: {len(db_citizens)}"))
    self.stdout.write(self.style.SUCCESS(f"  - Crimes / Cases: {len(db_crimes)} (Exactly 5 per Officer)"))
    self.stdout.write(self.style.SUCCESS("========================================================="))
