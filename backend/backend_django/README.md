# CrimePilot — Django REST Framework (DRF) Backend

This is the Python + Django + Django REST Framework backend for **CrimePilot**, transitioned from the Node.js/Express version. It is configured to run on a local SQLite database (SQL Option A) and exposes the exact same API envelope structure and JWT claims to ensure 100% compatibility with the React frontend.

---

## Installation & Setup

1. **Prerequisites**
   Ensure you have Python 3.10+ installed on your system.

2. **Navigate to the Backend Directory and Install Python Packages**
   ```bash
   cd J:\CrimePilot\backend_django
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers reportlab python-dotenv
   ```

3. **Configure Environment Variables**
   The application uses environment settings from the project root. If needed, you can create a `.env` file inside `backend_django/` containing:
   ```env
   DJANGO_SECRET_KEY=django-insecure-crimepilot-key-2026-xyz
   JWT_SECRET=crimepilot_super_jwt_secret_key_2026
   ```

4. **Apply Database Migrations**
   Initialize the SQLite database (`db.sqlite3`):
   ```bash
   python manage.py makemigrations authentication core logs
   python manage.py migrate
   ```

5. **Seed the Database**
   Pre-populates categories with legal sections (BNS/BNSS/BSA), geography locations, and a default system administrator:
   ```bash
   python manage.py seed_db
   ```
   **Default Admin Credentials:**
   - **Email:** `admin@crimepilot.com`
   - **Password:** `admin@1234`

6. **Start the Development Server**
   To connect with the React frontend seamlessly, start the server on port **5000**:
   ```bash
   python manage.py runserver 5000
   ```

7. **Run Integration Tests**
   Runs all 15 automated integration tests validating auth, status progressions, similar cases, and dashboards:
   ```bash
   python test_django_api.py
   ```

---

## Key Custom Features Implemented

1. **🌟 Custom Feature A: BNS/BNSS Legal Sections**
   - Mapped to `JSONField` in `CrimeCategory` model. 
   - Endpoint `/api/crime-categories/<id>/sections` returns the exact sections array matching the category type.

2. **🌟 Custom Feature B: Pending Case Flag**
   - Added as a serializable read-only property `isPending` inside `CrimeSerializer` based on whether the case status is not Solved or Closed.
   - Endpoint `/api/crimes/pending` filters active cases.

3. **🌟 Custom Feature C: Similar Cases Weighted Matching**
   - Custom view action matching other cases dynamically using a weighted scoring algorithm: Same category (**5 pts**), Location proximity (**2-4 pts**), Timing proximity (**1-3 pts**), and Description keyword overlap (**1 pt/word**).
   - Returns top 10 ranked cases.
