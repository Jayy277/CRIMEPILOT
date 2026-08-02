import os
import sys
import csv
import django

# Add django backend to sys.path so we can import settings
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
django_path = os.path.join(BASE_DIR, 'backend', 'backend_django')
sys.path.append(django_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crimepilot_django.settings')

# Bypass Django's MariaDB version check for compatibility with older XAMPP versions
from django.db.backends.mysql.base import DatabaseWrapper
DatabaseWrapper.check_database_version_supported = lambda self: None

django.setup()

from django.db import connection
from utils import CSV_DIR

def run_migration():
    print("Connecting to database via Django context for migration...")
    
    with connection.cursor() as cursor:
        # 1. Create tables
        print("Creating tables if they don't exist...")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS `synthetic_judgments` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `case_id` VARCHAR(50) NOT NULL UNIQUE,
          `court` VARCHAR(255) NOT NULL,
          `judge` VARCHAR(255) NOT NULL,
          `facts` TEXT NOT NULL,
          `issues` TEXT NOT NULL,
          `evidence_summary` TEXT NOT NULL,
          `decision` TEXT NOT NULL,
          `sentence` TEXT NOT NULL,
          `bns_sections` VARCHAR(255) NOT NULL,
          `bnss_procedures` VARCHAR(255) NOT NULL,
          `bsa_provisions` VARCHAR(255) NOT NULL,
          `judgment_summary` TEXT NOT NULL,
          `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS `predictions` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `input_text` TEXT NOT NULL,
          `category` VARCHAR(100) NOT NULL,
          `predicted_bns` VARCHAR(255) NOT NULL,
          `predicted_bnss` VARCHAR(255) NOT NULL,
          `predicted_bsa` VARCHAR(255) NOT NULL,
          `punishment` VARCHAR(255) NOT NULL,
          `outcome` VARCHAR(255) NOT NULL,
          `duration_months` FLOAT NOT NULL,
          `confidence_score` FLOAT NOT NULL,
          `keywords` TEXT NOT NULL,
          `evidence_required` TEXT NOT NULL,
          `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
        """)
        
        # 2. Insert synthetic judgments from CSV
        csv_path = os.path.join(CSV_DIR, 'judgments_dataset.csv')
        if os.path.exists(csv_path):
            print("Inserting judgments into database...")
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                judgments = list(reader)
                
            # Clear existing ones to avoid duplicate key errors on reload
            cursor.execute("DELETE FROM synthetic_judgments")
            
            insert_query = """
            INSERT INTO synthetic_judgments (
                case_id, court, judge, facts, issues, evidence_summary, 
                decision, sentence, bns_sections, bnss_procedures, 
                bsa_provisions, judgment_summary
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            data_to_insert = [
                (
                    j['case_id'], j['court'], j['judge'], j['facts'], j['issues'], 
                    j['evidence_summary'], j['decision'], j['sentence'], 
                    j['bns_sections'], j['bnss_procedures'], j['bsa_provisions'], 
                    j['judgment_summary']
                )
                for j in judgments
            ]
            
            cursor.executemany(insert_query, data_to_insert)
            print(f"Successfully migrated database. {len(data_to_insert)} judgments inserted.")
        else:
            print("Judgments CSV not found. Please run dataset generator first.")

if __name__ == "__main__":
    run_migration()
