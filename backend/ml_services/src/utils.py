import os
import mysql.connector
from dotenv import load_dotenv

# Find and load the env file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
django_env_path = os.path.join(BASE_DIR, 'backend', 'backend_django', '.env')

if os.path.exists(django_env_path):
    load_dotenv(django_env_path)
else:
    load_dotenv()

# Setup standard directory paths
DATASET_DIR = os.path.join(BASE_DIR, 'dataset')
CSV_DIR = os.path.join(DATASET_DIR, 'csv')
JSON_DIR = os.path.join(DATASET_DIR, 'json')
RAW_DIR = os.path.join(DATASET_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATASET_DIR, 'processed')
VECTOR_DIR = os.path.join(DATASET_DIR, 'vectorstore')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Create necessary directories
for directory in [DATASET_DIR, CSV_DIR, JSON_DIR, RAW_DIR, PROCESSED_DIR, VECTOR_DIR, MODELS_DIR]:
    os.makedirs(directory, exist_ok=True)
    
for raw_subdir in ['complaints', 'fir', 'judgments', 'laws', 'images']:
    os.makedirs(os.path.join(RAW_DIR, raw_subdir), exist_ok=True)

for proc_subdir in ['train', 'validation', 'test', 'embeddings']:
    os.makedirs(os.path.join(PROCESSED_DIR, proc_subdir), exist_ok=True)

def get_db_connection():
    """
    Returns a connection to the MySQL database.
    """
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'crimepilot'),
        port=int(os.environ.get('DB_PORT', 3306))
    )
