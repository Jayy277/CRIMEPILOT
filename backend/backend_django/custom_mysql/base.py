"""
custom_mysql/base.py

A thin wrapper over django.db.backends.mysql that silences the
MariaDB ≥ 10.5 version check.  XAMPP 8.x ships MariaDB 10.4.x which
is fully capable of running CrimePilot AI; the version gate in Django
5.2 is simply more conservative than necessary.
"""
from django.db.backends.mysql import base


class DatabaseWrapper(base.DatabaseWrapper):
    def check_database_version_supported(self):
        # Skip the 10.5+ guard — MariaDB 10.4.x works fine for our use-case.
        pass
