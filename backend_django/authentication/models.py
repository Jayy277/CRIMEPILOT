from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
  def create_user(self, email, name, password=None, role='officer', **extra_fields):
    if not email:
      raise ValueError('Users must have an email address')
    email = self.normalize_email(email)
    user = self.model(email=email, name=name, role=role, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user

  def create_superuser(self, email, name, password=None, **extra_fields):
    extra_fields.setdefault('is_staff', True)
    extra_fields.setdefault('is_superuser', True)
    extra_fields.setdefault('role', 'admin')

    if extra_fields.get('is_staff') is not True:
      raise ValueError('Superuser must have is_staff=True.')
    if extra_fields.get('is_superuser') is not True:
      raise ValueError('Superuser must have is_superuser=True.')

    return self.create_user(email, name, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
  ROLE_CHOICES = (
    ('officer', 'Officer'),
    ('analyst', 'Analyst'),
    ('admin', 'Admin'),
    ('citizen', 'Citizen'),
  )

  name = models.CharField(max_length=255)
  email = models.EmailField(max_length=255, unique=True)
  role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='officer')
  is_active = models.BooleanField(default=True)
  is_staff = models.BooleanField(default=False)
  reset_password_token = models.CharField(max_length=255, null=True, blank=True)
  reset_password_expire = models.DateTimeField(null=True, blank=True)
  profile_picture = models.CharField(max_length=255, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  objects = CustomUserManager()

  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = ['name']

  def __str__(self):
    return f"{self.name} ({self.email})"

class Officer(models.Model):
  user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='officer_profile')
  badge_no = models.CharField(max_length=50, unique=True)
  station = models.ForeignKey('core.Location', on_delete=models.PROTECT, related_name='officers')
  contact = models.CharField(max_length=50)
  profile_picture = models.CharField(max_length=255, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Officer {self.badge_no} - {self.user.name}"

class Analyst(models.Model):
  user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='analyst_profile')
  department = models.CharField(max_length=255)
  profile_picture = models.CharField(max_length=255, null=True, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Analyst {self.user.name} - {self.department}"

class Citizen(models.Model):
  STATUS_CHOICES = (
    ('pending', 'Pending Verification'),
    ('verified', 'Verified Citizen'),
    ('rejected', 'Rejected'),
  )

  user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='citizen_profile')
  mobile = models.CharField(max_length=20)
  dob = models.DateField(null=True, blank=True)
  gender = models.CharField(max_length=20, null=True, blank=True)
  address = models.TextField(null=True, blank=True)
  state = models.CharField(max_length=100, null=True, blank=True)
  city = models.CharField(max_length=100, null=True, blank=True)
  pincode = models.CharField(max_length=20, null=True, blank=True)
  identity_type = models.CharField(max_length=50) # Aadhaar Card, Driving License, Passport, Voter ID
  identity_number = models.CharField(max_length=100)
  identity_document = models.CharField(max_length=255, null=True, blank=True)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Citizen {self.user.name} - Status: {self.status}"
