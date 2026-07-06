from django.db import models

class Location(models.Model):
  state = models.CharField(max_length=100)
  district = models.CharField(max_length=100)
  city = models.CharField(max_length=100)
  police_station = models.CharField(max_length=200)

  class Meta:
    unique_together = ('state', 'district', 'city', 'police_station')

  def __str__(self):
    return f"{self.police_station} ({self.city}, {self.state})"

class CrimeCategory(models.Model):
  name = models.CharField(max_length=100, unique=True)
  sections = models.JSONField(default=list) # List of {act, section, description}

  def __str__(self):
    return self.name

class Crime(models.Model):
  PRIORITY_CHOICES = (
    ('Low', 'Low'),
    ('Medium', 'Medium'),
    ('High', 'High'),
    ('Critical', 'Critical'),
  )

  STATUS_CHOICES = (
    ('Reported', 'Reported'),
    ('Assigned', 'Assigned'),
    ('Under Investigation', 'Under Investigation'),
    ('Evidence Collected', 'Evidence Collected'),
    ('Solved', 'Solved'),
    ('Closed', 'Closed'),
  )

  crime_id = models.CharField(max_length=50, unique=True, blank=True)
  crime_category = models.ForeignKey(CrimeCategory, on_delete=models.PROTECT, related_name='crimes')
  date = models.DateField()
  time = models.CharField(max_length=10) # HH:MM
  location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='crimes')
  description = models.TextField()
  officer = models.ForeignKey('authentication.Officer', on_delete=models.PROTECT, related_name='crimes')
  citizen = models.ForeignKey('authentication.Citizen', on_delete=models.SET_NULL, null=True, blank=True, related_name='crimes')
  priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
  status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Reported')
  sections = models.JSONField(default=list) # List of selected sections {act, section, description}
  notes = models.JSONField(default=list) # List of notes {note, addedBy_id, addedBy_name, created_at}
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  @property
  def is_pending(self):
    return self.status not in ['Solved', 'Closed']

  def save(self, *args, **kwargs):
    if not self.crime_id:
      year = self.date.year if self.date else 2026
      count = Crime.objects.filter(date__year=year).count()
      sequence = f"{count + 1:05d}"
      self.crime_id = f"CR-{year}-{sequence}"
    super().save(*args, **kwargs)

  def __str__(self):
    return f"{self.crime_id} - {self.crime_category.name}"

class Suspect(models.Model):
  STATUS_CHOICES = (
    ('Suspect', 'Suspect'),
    ('Detained', 'Detained'),
    ('Arrested', 'Arrested'),
    ('Released', 'Released'),
  )

  name = models.CharField(max_length=255)
  age = models.IntegerField(null=True, blank=True)
  gender = models.CharField(max_length=20, null=True, blank=True)
  address = models.TextField(null=True, blank=True)
  photo_path = models.CharField(max_length=500, default='', blank=True)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Suspect')
  linked_crime = models.ForeignKey(Crime, on_delete=models.CASCADE, related_name='suspects')
  previous_cases = models.ManyToManyField(Crime, blank=True, related_name='previous_suspects')
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.name} ({self.status}) - Crime: {self.linked_crime.crime_id}"

class Victim(models.Model):
  name = models.CharField(max_length=255)
  contact = models.CharField(max_length=50, null=True, blank=True)
  statement = models.TextField()
  evidence_reference = models.CharField(max_length=255, default='', blank=True)
  linked_crime = models.ForeignKey(Crime, on_delete=models.CASCADE, related_name='victims')
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.name} - Victim for {self.linked_crime.crime_id}"

class Evidence(models.Model):
  evidence_id = models.CharField(max_length=50, unique=True, blank=True)
  type = models.CharField(max_length=100)
  description = models.TextField()
  collection_date = models.DateField()
  assigned_officer = models.ForeignKey('authentication.Officer', on_delete=models.PROTECT, related_name='evidences')
  linked_crime = models.ForeignKey(Crime, on_delete=models.CASCADE, related_name='evidences')
  file_path = models.CharField(max_length=500, default='', blank=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def save(self, *args, **kwargs):
    if not self.evidence_id:
      year = self.collection_date.year if self.collection_date else 2026
      count = Evidence.objects.count()
      sequence = f"{count + 1:05d}"
      self.evidence_id = f"EV-{year}-{sequence}"
    super().save(*args, **kwargs)

  def __str__(self):
    return f"{self.evidence_id} - {self.type}"

class Notification(models.Model):
  TYPE_CHOICES = (
    ('New Case Assigned', 'New Case Assigned'),
    ('Investigation Deadline', 'Investigation Deadline'),
    ('High Priority Alert', 'High Priority Alert'),
  )

  type = models.CharField(max_length=50, choices=TYPE_CHOICES)
  recipient = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE, related_name='notifications')
  message = models.TextField()
  read = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"Notify {self.recipient.name} - {self.type}"
