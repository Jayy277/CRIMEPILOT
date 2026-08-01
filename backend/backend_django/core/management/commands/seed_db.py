import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from core.models import Location, CrimeCategory, Crime, Suspect, Victim, Evidence
from authentication.models import Officer, Analyst, Citizen

User = get_user_model()

multi_city_locations = [
  # Ahmedabad
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Ahmedabad City Police Headquarters' },
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Navrangpura Police Station' },
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Satellite Police Station' },
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Vastrapur Police Station' },
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Maninagar Police Station' },
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Sabarmati Police Station' },
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Paldi Police Station' },
  { 'state': 'Gujarat', 'district': 'Ahmedabad', 'city': 'Ahmedabad', 'police_station': 'Sarkhej Police Station' },

  # Rajkot
  { 'state': 'Gujarat', 'district': 'Rajkot', 'city': 'Rajkot', 'police_station': 'Rajkot City A Division Police Station' },
  { 'state': 'Gujarat', 'district': 'Rajkot', 'city': 'Rajkot', 'police_station': 'Rajkot B Division Police Station' },
  { 'state': 'Gujarat', 'district': 'Rajkot', 'city': 'Rajkot', 'police_station': 'University Police Station' },
  { 'state': 'Gujarat', 'district': 'Rajkot', 'city': 'Rajkot', 'police_station': 'Gandhigram Police Station' },
  { 'state': 'Gujarat', 'district': 'Rajkot', 'city': 'Rajkot', 'police_station': 'Pradyuman Nagar Police Station' },

  # Gandhinagar
  { 'state': 'Gujarat', 'district': 'Gandhinagar', 'city': 'Gandhinagar', 'police_station': 'Gandhinagar Sector 7 Police Station' },
  { 'state': 'Gujarat', 'district': 'Gandhinagar', 'city': 'Gandhinagar', 'police_station': 'Gandhinagar Sector 21 Police Station' },
  { 'state': 'Gujarat', 'district': 'Gandhinagar', 'city': 'Gandhinagar', 'police_station': 'Infocity Police Station' },
  { 'state': 'Gujarat', 'district': 'Gandhinagar', 'city': 'Gandhinagar', 'police_station': 'Chiloda Police Station' },
  { 'state': 'Gujarat', 'district': 'Gandhinagar', 'city': 'Gandhinagar', 'police_station': 'Adalaj Police Station' },
]

sample_categories = [
  { 'name': 'Cyber Crime', 'sections': [{'act': 'IT Act', 'section': '66D', 'description': 'Cheating by personation using computer resource'}] },
  { 'name': 'Online Fraud', 'sections': [{'act': 'BNS', 'section': '318', 'description': 'Cheating and dishonestly inducing delivery of property'}] },
  { 'name': 'Financial Fraud', 'sections': [{'act': 'BNS', 'section': '316', 'description': 'Criminal breach of trust'}] },
  { 'name': 'Mobile Theft', 'sections': [{'act': 'BNS', 'section': '303', 'description': 'Theft of moveable property'}] },
  { 'name': 'Vehicle Theft', 'sections': [{'act': 'BNS', 'section': '305', 'description': 'Theft of motor vehicle'}] },
  { 'name': 'House Burglary', 'sections': [{'act': 'BNS', 'section': '307', 'description': 'Lurking house-trespass or house-breaking'}] },
  { 'name': 'Missing Person', 'sections': [{'act': 'BNSS', 'section': '84', 'description': 'Proclamation for person absconding/missing'}] },
  { 'name': 'Domestic Violence', 'sections': [{'act': 'BNS', 'section': '85', 'description': 'Husband or relative of husband subjecting woman to cruelty'}] },
  { 'name': 'Chain Snatching', 'sections': [{'act': 'BNS', 'section': '304', 'description': 'Snatching with criminal force'}] },
  { 'name': 'Public Assault', 'sections': [{'act': 'BNS', 'section': '115', 'description': 'Voluntarily causing hurt'}] },
  { 'name': 'Property Damage', 'sections': [{'act': 'BNS', 'section': '324', 'description': 'Mischief causing damage'}] },
  { 'name': 'Drug Related', 'sections': [{'act': 'NDPS Act', 'section': '20', 'description': 'Possession and trafficking of psychotropic substances'}] },
  { 'name': 'Traffic Hit & Run', 'sections': [{'act': 'BNS', 'section': '106', 'description': 'Causing death or injury by negligent driving'}] },
  { 'name': 'Robbery', 'sections': [{'act': 'BNS', 'section': '309', 'description': 'Robbery and punishment'}] },
  { 'name': 'Suspicious Activity', 'sections': [{'act': 'BNSS', 'section': '170', 'description': 'Preventive action by police'}] },
]

class Command(BaseCommand):
  help = 'Seeds database with 30 realistic fictional crime cases across Ahmedabad, Rajkot, and Gandhinagar'

  def handle(self, *args, **kwargs):
    self.stdout.write('Purging old records and seeding 30 multi-city cases...')

    from logs.models import AuditLog

    Suspect.objects.all().delete()
    Victim.objects.all().delete()
    Evidence.objects.all().delete()
    Crime.objects.all().delete()
    AuditLog.objects.all().delete()
    Officer.objects.all().delete()
    Analyst.objects.all().delete()
    Citizen.objects.all().delete()

    User.objects.filter(is_superuser=False).delete()
    Location.objects.all().delete()
    CrimeCategory.objects.all().delete()

    # 1. Seed Locations
    db_locs = {}
    for loc in multi_city_locations:
      obj = Location.objects.create(**loc)
      db_locs[loc['police_station']] = obj

    # 2. Seed Categories
    db_cats = {}
    for cat in sample_categories:
      obj = CrimeCategory.objects.create(**cat)
      db_cats[cat['name']] = obj

    # 3. Seed Admin
    admin_user, _ = User.objects.get_or_create(
      email='admin@crimepilot.com',
      defaults={'name': 'System Administrator', 'role': 'admin', 'is_superuser': True, 'is_staff': True}
    )
    admin_user.set_password('admin@1234')
    admin_user.save()

    # 4. Seed Officers matched by City
    officers_list = [
      ('raj.mehta@police.gov.in', 'Inspector Raj Mehta', 'BADGE-4001', db_locs['Satellite Police Station']),
      ('priya.shah@police.gov.in', 'Inspector Priya Shah', 'BADGE-4002', db_locs['Navrangpura Police Station']),
      ('rahul.patel@police.gov.in', 'SI Rahul Patel', 'BADGE-4003', db_locs['Sabarmati Police Station']),
      ('neha.joshi@police.gov.in', 'SI Neha Joshi', 'BADGE-4004', db_locs['Paldi Police Station']),
      ('vivek.rana@police.gov.in', 'Inspector Vivek Rana', 'BADGE-4005', db_locs['Rajkot City A Division Police Station']),
      ('karan.desai@police.gov.in', 'PSI Karan Desai', 'BADGE-4006', db_locs['University Police Station']),
      ('harsh.trivedi@police.gov.in', 'ACP Harsh Trivedi', 'BADGE-4007', db_locs['Infocity Police Station']),
      ('ankit.shah@police.gov.in', 'DCP Ankit Shah', 'BADGE-4008', db_locs['Gandhinagar Sector 7 Police Station']),
    ]

    db_officers = []
    for email, name, badge, loc_obj in officers_list:
      u = User.objects.create_user(email=email, name=name, password='Officer@123', role='officer')
      off = Officer.objects.create(user=u, badge_no=badge, station=loc_obj, contact='9876543210')
      db_officers.append(off)

    # 5. Seed 30 Cases with exact workflow breakdown:
    # 5 Registered, 5 Assigned, 8 Under Investigation, 4 Evidence Collected, 3 Solved (Charge Sheet Filed), 5 Closed
    raw_cases = [
      # --- LAST 7 DAYS (8 cases: CP-0001 to CP-0008) ---
      ('CP-2026-0001', '2026-07-30', '14:20', 'Satellite Police Station', 'Cyber Crime', 'High', 'Reported', 'Aarav Patel', 0, 'Citizen reported an unauthorized transaction of ₹85,000 from net banking account via phishing SMS link.', 'Bank Statement'),
      ('CP-2026-0002', '2026-07-30', '18:45', 'Rajkot City A Division Police Station', 'Mobile Theft', 'Low', 'Reported', 'Riya Shah', 4, 'Complainant smartphone was stolen from coat pocket while walking near Race Course Ground, Rajkot.', 'CCTV Footage'),
      ('CP-2026-0003', '2026-07-29', '11:15', 'Infocity Police Station', 'Online Fraud', 'Medium', 'Reported', 'Devansh Joshi', 6, 'Victim defrauded of ₹45,000 on fake rental housing portal in Infocity Sector 02, Gandhinagar.', 'Digital Documents'),
      ('CP-2026-0004', '2026-07-28', '21:30', 'Navrangpura Police Station', 'Chain Snatching', 'High', 'Reported', 'Harsh Mehta', 1, 'Two masked suspects on bike snatched gold chain near CG Road shopping market, Ahmedabad.', 'CCTV Footage'),
      ('CP-2026-0005', '2026-07-27', '02:40', 'University Police Station', 'Vehicle Theft', 'Medium', 'Reported', 'Kavya Desai', 5, 'Motorcycle stolen overnight from student housing parking near Kalawad Road, Rajkot.', 'Vehicle Images'),
      ('CP-2026-0006', '2026-07-26', '16:00', 'Gandhinagar Sector 7 Police Station', 'Financial Fraud', 'Critical', 'Assigned', 'Ananya Parikh', 7, 'Commercial firm defrauded of ₹8.5 Lakhs by fake vendor account impersonation in Sector 7, Gandhinagar.', 'Bank Statement'),
      ('CP-2026-0007', '2026-07-25', '20:10', 'Vastrapur Police Station', 'Public Assault', 'Medium', 'Assigned', 'Siddharth Trivedi', 0, 'Physical fight broke out near Vastrapur Lake over minor traffic collision.', 'Mobile Recording'),
      ('CP-2026-0008', '2026-07-24', '23:15', 'Gandhigram Police Station', 'Property Damage', 'Low', 'Assigned', 'Pooja Bhatt', 4, 'Shop display glass broken by unknown miscreants overnight near 150 Feet Ring Road, Rajkot.', 'Photographs'),

      # --- LAST 30 DAYS (10 cases: CP-0009 to CP-0018) ---
      ('CP-2026-0009', '2026-07-22', '08:30', 'Paldi Police Station', 'Domestic Violence', 'High', 'Assigned', 'Sneha Solanki', 3, 'Formal complaint regarding physical harassment and property dispute filed in Paldi, Ahmedabad.', 'Witness Statement'),
      ('CP-2026-0010', '2026-07-20', '17:00', 'Chiloda Police Station', 'Traffic Hit & Run', 'Critical', 'Assigned', 'Rohan Verma', 6, 'Speeding car struck two-wheeler rider near Chiloda circle, Gandhinagar and fled scene.', 'CCTV Footage'),
      ('CP-2026-0011', '2026-07-18', '12:15', 'Pradyuman Nagar Police Station', 'Missing Person', 'High', 'Under Investigation', 'Tanvi Chawla', 5, '19-year-old student missing after leaving college hostel in Raiya Road, Rajkot.', 'Call Logs'),
      ('CP-2026-0012', '2026-07-15', '03:40', 'Sarkhej Police Station', 'House Burglary', 'Critical', 'Under Investigation', 'Amit Vora', 2, 'Break-in at locked bungalow near SG Highway. Cash and valuables worth ₹3.2 Lakhs stolen.', 'Fingerprint Report'),
      ('CP-2026-0013', '2026-07-12', '01:20', 'Adalaj Police Station', 'Drug Related', 'Critical', 'Under Investigation', 'Vikram Rathod', 7, 'Vehicle interdicted near Adalaj highway containing illegal psychotropic substances.', 'GPS Data'),
      ('CP-2026-0014', '2026-07-10', '15:50', 'Sabarmati Police Station', 'Robbery', 'High', 'Under Investigation', 'Rajesh Varma', 2, 'Attempted robbery at retail store near Sabarmati riverfront. CCTV footage seized.', 'CCTV Footage'),
      ('CP-2026-0015', '2026-07-08', '22:15', 'Rajkot B Division Police Station', 'Suspicious Activity', 'Low', 'Under Investigation', 'Neeta Patel', 4, 'Suspicious vehicle loitering near industrial area on Kalawad Road, Rajkot.', 'Photographs'),
      ('CP-2026-0016', '2026-07-05', '10:00', 'Gandhinagar Sector 21 Police Station', 'Cyber Crime', 'High', 'Under Investigation', 'Chirag Shah', 7, 'Fake social media profile created to defame university faculty member in Sector 21, Gandhinagar.', 'Digital Documents'),
      ('CP-2026-0017', '2026-07-02', '14:30', 'Maninagar Police Station', 'Mobile Theft', 'Low', 'Under Investigation', 'Bhavna Joshi', 3, 'Smart phone stolen from passenger at Maninagar bus terminus, Ahmedabad.', 'Call Logs'),
      ('CP-2026-0018', '2026-06-28', '19:20', 'University Police Station', 'Vehicle Theft', 'Medium', 'Under Investigation', 'Hardik Solanki', 5, 'SUV stolen from commercial complex parking lot near University Road, Rajkot.', 'Vehicle Images'),

      # --- LAST 6 MONTHS (12 cases: CP-0019 to CP-0030) ---
      ('CP-2026-0019', '2026-06-18', '11:00', 'Navrangpura Police Station', 'Financial Fraud', 'Critical', 'Evidence Collected', 'Maya Parikh', 1, 'Fake banking executive lured victim into downloading screen-sharing app, draining account.', 'Bank Statement'),
      ('CP-2026-0020', '2026-06-10', '13:10', 'Infocity Police Station', 'Online Fraud', 'Medium', 'Evidence Collected', 'Jayesh Trivedi', 6, 'E-commerce buyer received counterfeit goods from fraudulent online seller based in Gandhinagar.', 'Digital Documents'),
      ('CP-2026-0021', '2026-05-28', '16:45', 'Rajkot City A Division Police Station', 'Chain Snatching', 'High', 'Evidence Collected', 'Rekha Bhatt', 4, 'Gold chain snatched from pedestrian near Race Course Road, Rajkot.', 'CCTV Footage'),
      ('CP-2026-0022', '2026-05-15', '21:00', 'Satellite Police Station', 'Public Assault', 'Medium', 'Evidence Collected', 'Nisha Rajput', 0, 'Argument over parking at Satellite commercial hub escalated into physical brawl.', 'Mobile Recording'),
      ('CP-2026-0023', '2026-05-04', '09:30', 'Gandhinagar Sector 7 Police Station', 'Missing Person', 'High', 'Solved', 'Gopal Chawla', 7, 'Missing teenager traced to friend house in Sector 7 and safely returned to parents.', 'GPS Data'),
      ('CP-2026-0024', '2026-04-20', '18:10', 'Gandhigram Police Station', 'Traffic Hit & Run', 'Medium', 'Solved', 'Alpana Vora', 4, 'Hit and run suspect vehicle identified via traffic camera logs near 150 Feet Ring Road.', 'Vehicle Images'),
      ('CP-2026-0025', '2026-04-10', '23:00', 'Paldi Police Station', 'House Burglary', 'High', 'Solved', 'Kunal Mehta', 3, 'Burglary suspect apprehended during night patrol; stolen gold ornaments fully recovered.', 'Fingerprint Report'),
      ('CP-2026-0026', '2026-03-25', '04:15', 'Sabarmati Police Station', 'Property Damage', 'Low', 'Closed', 'Dipti Shah', 2, 'Accidental wall collision by delivery truck; owner settled damages directly.', 'Photographs'),
      ('CP-2026-0027', '2026-03-12', '17:30', 'Adalaj Police Station', 'Drug Related', 'Critical', 'Closed', 'Tarun Joshi', 6, 'Illicit contraband seized; offender convicted under NDPS act by district court.', 'Digital Documents'),
      ('CP-2026-0028', '2026-02-28', '20:00', 'Pradyuman Nagar Police Station', 'Robbery', 'High', 'Closed', 'Hema Desai', 5, 'Commercial cash snatching case solved with complete recovery of stolen funds.', 'CCTV Footage'),
      ('CP-2026-0029', '2026-02-14', '11:40', 'Sarkhej Police Station', 'Suspicious Activity', 'Low', 'Closed', 'Pankaj Solanki', 0, 'Unattended bag verified as harmless lost luggage at SG Highway junction.', 'Witness Statement'),
      ('CP-2026-0030', '2026-02-02', '15:15', 'Chiloda Police Station', 'Mobile Theft', 'Low', 'Closed', 'Sonal Parikh', 7, 'Stolen handset recovered from second-hand market and delivered to owner.', 'Call Logs'),
    ]

    for cid, dt_str, tm, stn, cat_name, prio, st, cit_name, off_idx, desc, ev_type in raw_cases:
      dt = datetime.datetime.strptime(dt_str, '%Y-%m-%d').date()
      loc_obj = db_locs[stn]
      cat_obj = db_cats[cat_name]
      off_obj = db_officers[off_idx]

      cit_email = cit_name.lower().replace(' ', '') + '@gmail.com'
      u_cit, _ = User.objects.get_or_create(
        email=cit_email,
        defaults={'name': cit_name, 'password': 'User@1234', 'role': 'citizen'}
      )
      cit_obj, _ = Citizen.objects.get_or_create(
        user=u_cit,
        defaults={
          'mobile': '9876500112',
          'address': f"{loc_obj.police_station.replace(' Police Station', '')}, {loc_obj.city}",
          'identity_type': 'Aadhaar Card',
          'identity_number': '123456789012',
          'status': 'verified'
        }
      )

      crime = Crime.objects.create(
        crime_id=cid,
        crime_category=cat_obj,
        date=dt,
        time=tm,
        location=loc_obj,
        description=desc,
        officer=off_obj,
        citizen=cit_obj,
        priority=prio,
        status=st
      )

      Evidence.objects.create(
        type=ev_type,
        description=f"{ev_type} collected for case {cid} at {stn}",
        collection_date=dt,
        assigned_officer=off_obj,
        linked_crime=crime
      )

    self.stdout.write(self.style.SUCCESS(f'Successfully seeded 30 multi-city cases across Ahmedabad, Rajkot, and Gandhinagar!'))
