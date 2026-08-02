import os
import sys
from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Print check message once on server startup
        if os.environ.get('RUN_MAIN') == 'true' or '--noreload' in sys.argv or 'runserver' not in sys.argv:
            try:
                from django.db import connection
                connection.ensure_connection()
                print("\n" + "=" * 55)
                print("  SUCCESS: MySQL Database connected successfully! (XAMPP)")
                print("=" * 55 + "\n")
            except Exception as e:
                print("\n" + "!" * 55)
                print("  ERROR: Cannot connect to MySQL Database (XAMPP)!")
                print("  Please make sure XAMPP MySQL service is RUNNING.")
                print(f"  Error Details: {e}")
                print("!" * 55 + "\n")
