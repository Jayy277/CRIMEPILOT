import os
import re
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Location, Crime, Evidence
from authentication.models import Officer

User = get_user_model()

# Pool of realistic Indian officer names
INDIAN_NAMES = [
    "Amit Patel", "Rahul Shah", "Karan Desai", "Rajesh Verma", "Vikram Sharma",
    "Sanjay Trivedi", "Priya Joshi", "Neha Mehta", "Ajay Rana", "Deepak Solanki",
    "Pooja Pandya", "Ankit Bhatt", "Rakesh Vaghela", "Sunil Chavda", "Manoj Parmar",
    "Vijay Rathod", "Manish Dave", "Hardik Shah", "Chirag Patel", "Jignesh Mehta",
    "Parth Trivedi", "Bhavesh Gohil", "Jayesh Jadeja", "Sandeep Vyas", "Alok Sharma",
    "Harshvardhan Singh", "Pradeep Chauhan", "Vishal Kanzariya", "Gautam Zala", "Varun Dabhi",
    "Krunal Makwana", "Nirav Raval", "Siddharth Shukla", "Tushar Kothari", "Yatin Purohit",
    "Ashish Saxena", "Suresh Yadav", "Mahesh Choudhary", "Dinesh Barot", "Nilesh Shrimali",
    "Mayur Sonigra", "Tarun Thakar", "Darshan Gandhi", "Paresh Chothani", "Chetan Merchant",
    "Hemant Soni", "Devang Chokshi", "Biren Vora", "Shailesh Kapadia", "Hiren Parekh",
    "Piyush Vakil", "Romesh Adani", "Kamlesh Modi", "Nayan Merchant", "Gaurav Trivedi",
    "Ketan Vaghela", "Jitendra Solanki", "Lalit Joshi", "Umesh Patel", "Sameer Shah",
    "Nikhil Desai", "Kishan Dave", "Alpesh Rana", "Bhavin Bhatt", "Dhaval Parmar",
    "Vatsal Jadeja", "Yogesh Vyas", "Kinjal Sharma", "Mehul Chauhan", "Tejas Zala"
]

class Command(BaseCommand):
    help = 'Cleans and regenerates 3 Officer accounts for every Police Station in DB'

    def handle(self, *args, **kwargs):
        self.stdout.write('Regenerating Officers for every Police Station...')

        locations = Location.objects.all().order_by('city', 'id')
        if not locations.exists():
            self.stdout.write(self.style.ERROR('No locations found in database.'))
            return

        # 1. Create a temp officer to temporarily hold FK references
        temp_loc = locations.first()
        temp_user = User.objects.create_user(
            email='temp.officer.holder@crimepilot.com',
            name='Temp Officer Holder',
            password='TempPassword@123',
            role='officer'
        )
        temp_officer = Officer.objects.create(
            user=temp_user,
            badge_no='TEMP-HOLD-99999',
            station=temp_loc,
            contact='9999999999'
        )

        # Reassign all existing crimes and evidence to temp officer
        Crime.objects.all().update(officer=temp_officer)
        Evidence.objects.all().update(assigned_officer=temp_officer)

        # 2. Delete ALL other old officers first so Location deletion is not blocked
        Officer.objects.exclude(id=temp_officer.id).delete()
        User.objects.filter(role='officer').exclude(id=temp_user.id).delete()

        # 3. Trim Location table to keep exactly 3 police stations per city
        cities = Location.objects.values_list('city', flat=True).distinct()
        for city_name in cities:
            city_locs = list(Location.objects.filter(city=city_name).order_by('id'))
            if len(city_locs) > 3:
                kept_locs = city_locs[:3]
                deleted_locs = city_locs[3:]
                target_loc = kept_locs[0]
                for d_loc in deleted_locs:
                    Crime.objects.filter(location=d_loc).update(location=target_loc)
                    d_loc.delete()

        locations = Location.objects.all().order_by('city', 'id')

        created_officers = []
        name_idx = 0
        used_emails = set()
        global_count = 1000

        for loc in locations:
            city_clean = re.sub(r'[^a-zA-Z0-9]', '', loc.city.lower())
            city_prefix = city_clean[:3].upper() if len(city_clean) >= 3 else 'PS'

            station_officers = []
            for i in range(1, 4):
                global_count += 1
                if name_idx < len(INDIAN_NAMES):
                    full_name = INDIAN_NAMES[name_idx]
                    name_idx += 1
                else:
                    full_name = f"Officer {loc.city} {i}"

                name_no_spaces_lower = "".join(full_name.split()).lower()

                email = f"{name_no_spaces_lower}@crimepilot.com"
                
                # Handle potential duplicate email safety
                dup_counter = 1
                while email in used_emails or User.objects.filter(email=email).exists():
                    email = f"{name_no_spaces_lower}{dup_counter}@crimepilot.com"
                    dup_counter += 1
                used_emails.add(email)

                password = f"{name_no_spaces_lower}@1234"
                badge_no = f"BADGE-{city_prefix}-{global_count}"
                contact = f"9825{global_count:06d}"[-10:].zfill(10)

                user = User.objects.create_user(
                    email=email,
                    name=full_name,
                    password=password,
                    role='officer'
                )

                officer = Officer.objects.create(
                    user=user,
                    badge_no=badge_no,
                    station=loc,
                    contact=contact
                )

                station_officers.append(officer)
                created_officers.append({
                    'name': full_name,
                    'email': email,
                    'password': password,
                    'station': loc.police_station,
                    'city': loc.city,
                    'badge': badge_no,
                    'officer_obj': officer
                })

            # Update crimes for this location to point to the first new officer of this station
            if station_officers:
                Crime.objects.filter(location=loc).update(officer=station_officers[0])

        # 3. Clean up temp officer
        first_global_officer = created_officers[0]['officer_obj'] if created_officers else None
        if first_global_officer:
            Crime.objects.filter(officer=temp_officer).update(officer=first_global_officer)
            Evidence.objects.filter(assigned_officer=temp_officer).update(assigned_officer=first_global_officer)

        temp_officer.delete()
        temp_user.delete()

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(created_officers)} Officers across {locations.count()} Police Stations!'))
        
        # Print Table Output
        print("\n" + "="*115)
        print(f"{'Officer Name':<22} | {'Email':<35} | {'Password':<20} | {'Police Station':<32} | {'Badge No':<15}")
        print("="*115)
        for item in created_officers:
            print(f"{item['name']:<22} | {item['email']:<35} | {item['password']:<20} | {item['station'][:32]:<32} | {item['badge']:<15}")
        print("="*115 + "\n")
