import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-crimepilot-key-2026-xyz')

DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
  'django.contrib.admin',
  'django.contrib.auth',
  'django.contrib.contenttypes',
  'django.contrib.sessions',
  'django.contrib.messages',
  'django.contrib.staticfiles',
  
  # Third-party libraries
  'rest_framework',
  'rest_framework_simplejwt',
  'corsheaders',

  # Local apps
  'authentication',
  'core',
  'logs',
]

MIDDLEWARE = [
  'corsheaders.middleware.CorsMiddleware', # Put at top for CORS preflights
  'django.middleware.security.SecurityMiddleware',
  'django.contrib.sessions.middleware.SessionMiddleware',
  'django.middleware.common.CommonMiddleware',
  'django.middleware.csrf.CsrfViewMiddleware',
  'django.contrib.auth.middleware.AuthenticationMiddleware',
  'django.contrib.messages.middleware.MessageMiddleware',
  'django.middleware.clickjacking.XFrameOptionsMiddleware',
  
  # Custom logs middleware
  'logs.middleware.AuditLoggerMiddleware',
]

ROOT_URLCONF = 'crimepilot_django.urls'

TEMPLATES = [
  {
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
      'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
      ],
    },
  },
]

WSGI_APPLICATION = 'crimepilot_django.wsgi.application'

# Database configuration — MySQL / MariaDB (XAMPP)
# Django 4.2 natively supports MariaDB 10.4+ — no custom backend needed.
DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.mysql',
    'NAME': os.environ.get('DB_NAME', 'crimepilot'),
    'USER': os.environ.get('DB_USER', 'root'),
    'PASSWORD': os.environ.get('DB_PASSWORD', ''),
    'HOST': os.environ.get('DB_HOST', 'localhost'),
    'PORT': os.environ.get('DB_PORT', '3306'),
    'OPTIONS': {
      'charset': 'utf8mb4',
      'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    },
  }
}

# Custom User Configuration
AUTH_USER_MODEL = 'authentication.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
  {
    'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
  },
  {
    'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
  },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configurations
CORS_ALLOW_ALL_ORIGINS = True # Allow easy local frontend connections
CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
  'DEFAULT_AUTHENTICATION_CLASSES': (
    'rest_framework_simplejwt.authentication.JWTAuthentication',
  ),
  'DEFAULT_PERMISSION_CLASSES': (
    'rest_framework.permissions.IsAuthenticated',
  ),
}

# SimpleJWT Settings
SIMPLE_JWT = {
  'ACCESS_TOKEN_LIFETIME': timedelta(days=30), # Match JWT_EXPIRE=30d from Node
  'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
  'ROTATE_REFRESH_TOKENS': False,
  'BLACKLIST_AFTER_ROTATION': False,
  'ALGORITHM': 'HS256',
  'SIGNING_KEY': os.environ.get('JWT_SECRET', 'crimepilot_super_jwt_secret_key_2026'),
  'VERIFYING_KEY': None,
  'AUTH_HEADER_TYPES': ('Bearer',),
  'USER_ID_FIELD': 'id',
  'USER_ID_CLAIM': 'id',
}

# SMTP Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'crimepilot111@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'crimepilot1234')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

