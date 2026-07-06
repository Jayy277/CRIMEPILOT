import datetime
from django.utils import timezone
from django.db.models import Count, Q, F
from django.db.models.functions import ExtractYear, ExtractMonth
from django.http import HttpResponse
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.models import Officer, CustomUser
from authentication.serializers import OfficerSerializer, UserSerializer
from .models import Location, CrimeCategory, Crime, Suspect, Victim, Evidence, Notification
from .serializers import (
  LocationSerializer, CrimeCategorySerializer, CrimeSerializer, 
  SuspectSerializer, VictimSerializer, EvidenceSerializer, NotificationSerializer
)
from authentication.permissions import IsStaffUser, IsAdminUser, IsOfficerOrAdminUser, IsOfficerUser
from .utils import generate_report_pdf

STATUS_ORDER = ['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved', 'Closed']

# Helper to dispatch notifications
def notify(recipient, n_type, message):
  try:
    Notification.objects.create(recipient=recipient, type=n_type, message=message)
  except Exception as e:
    print("Notification error:", e)

class LocationViewSet(viewsets.ModelViewSet):
  queryset = Location.objects.all()
  serializer_class = LocationSerializer
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def list(self, request, *args, **kwargs):
    queryset = self.filter_queryset(self.get_queryset())
    serializer = self.get_serializer(queryset, many=True)
    return Response({'success': True, 'locations': serializer.data})

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance)
    return Response({'success': True, 'location': serializer.data})

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    return Response({'success': True, 'location': serializer.data}, status=status.HTTP_201_CREATED)

  def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response({'success': True, 'location': serializer.data})

  def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response({'success': True, 'message': 'Location deleted successfully'})


class CrimeCategoryViewSet(viewsets.ModelViewSet):
  queryset = CrimeCategory.objects.all()
  serializer_class = CrimeCategorySerializer
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def list(self, request, *args, **kwargs):
    queryset = self.filter_queryset(self.get_queryset())
    serializer = self.get_serializer(queryset, many=True)
    return Response({'success': True, 'categories': serializer.data})

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance)
    return Response({'success': True, 'category': serializer.data})

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    return Response({'success': True, 'category': serializer.data}, status=status.HTTP_201_CREATED)

  def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response({'success': True, 'category': serializer.data})

  def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response({'success': True, 'message': 'Category deleted successfully'})

  # Custom Feature A: Fetch sections list
  @action(detail=True, methods=['get'], url_path='sections', permission_classes=[permissions.IsAuthenticated])
  def get_sections(self, request, pk=None):
    category = self.get_object()
    return Response({'success': True, 'sections': category.sections})


class CrimeViewSet(viewsets.ModelViewSet):
  queryset = Crime.objects.all().order_by('-created_at')
  serializer_class = CrimeSerializer
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def get_queryset(self):
    queryset = super().get_queryset()
    params = self.request.query_params

    # Filter scopes
    crime_id = params.get('crimeId')
    category_id = params.get('crimeCategory')
    location_id = params.get('location')
    priority = params.get('priority')
    status_filter = params.get('status')
    search = params.get('search')
    suspect_name = params.get('suspectName')
    assigned_only = params.get('assignedOnly')

    if crime_id:
      queryset = queryset.filter(crime_id__icontains=crime_id)
    if category_id:
      queryset = queryset.filter(crime_category_id=category_id)
    if location_id:
      queryset = queryset.filter(location_id=location_id)
    if priority:
      queryset = queryset.filter(priority=priority)
    if status_filter:
      queryset = queryset.filter(status=status_filter)
    if search:
      queryset = queryset.filter(description__icontains=search)
      
    if suspect_name:
      crime_ids = Suspect.objects.filter(name__icontains=suspect_name).values_list('linked_crime_id', flat=True)
      queryset = queryset.filter(id__in=crime_ids)

    if assigned_only == 'true' and self.request.user.role == 'officer':
      officer = Officer.objects.filter(user=self.request.user).first()
      if officer:
        queryset = queryset.filter(officer=officer)

    return queryset

  def list(self, request, *args, **kwargs):
    queryset = self.filter_queryset(self.get_queryset())
    serializer = self.get_serializer(queryset, many=True)
    return Response({'success': True, 'count': len(serializer.data), 'crimes': serializer.data})

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance)
    return Response({'success': True, 'crime': serializer.data})

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    # Return crime object directly on root level to match Express response: res.status(201).json({ success: true, crime })
    return Response({'success': True, 'crime': serializer.data}, status=status.HTTP_201_CREATED)

  def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response({'success': True, 'crime': serializer.data})

  def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response({'success': True, 'message': 'Crime case deleted successfully'})

  def perform_create(self, serializer):
    # Retrieve assigned officer profile
    officer_profile = serializer.validated_data.get('officer')
    crime = serializer.save()

    # Dispatch alerts
    # 1. New Case Assigned to officer
    if officer_profile and officer_profile.user:
      notify(
        officer_profile.user,
        'New Case Assigned',
        f"You have been assigned to Case: {crime.crime_id} ({crime.description[:40]}...)"
      )

    # 2. High Priority Alert to admin users and officer
    if crime.priority in ['High', 'Critical']:
      admins = CustomUser.objects.filter(role='admin')
      for admin in admins:
        notify(
          admin,
          'High Priority Alert',
          f"High Priority Case Created: {crime.crime_id} assigned to officer {officer_profile.badge_no}"
        )

  # Custom Feature B: Pending cases flag view
  @action(detail=False, methods=['get'], url_path='pending')
  def pending_crimes(self, request):
    pending = self.get_queryset().filter(status__in=['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected'])
    serializer = self.get_serializer(pending, many=True)
    return Response({
      'success': True,
      'count': len(serializer.data),
      'crimes': serializer.data
    })

  # Patch to progress status strictly (Reported -> Assigned -> ...)
  @action(detail=True, methods=['patch'], url_path='status', permission_classes=[IsOfficerOrAdminUser])
  def update_status(self, request, pk=None):
    crime = self.get_object()
    target_status = request.data.get('status')

    # Security check: officers can only update their own assigned cases
    if request.user.role == 'officer':
      officer = Officer.objects.filter(user=request.user).first()
      if not officer or crime.officer_id != officer.id:
        return Response({'success': False, 'message': 'Unauthorized. Case is not assigned to you.'}, status=status.HTTP_403_FORBIDDEN)

    if target_status not in STATUS_ORDER:
      return Response(
        {'success': False, 'message': f"Invalid status. Choose from: {', '.join(STATUS_ORDER)}"},
        status=status.HTTP_400_BAD_REQUEST
      )

    current_idx = STATUS_ORDER.index(crime.status)
    target_idx = STATUS_ORDER.index(target_status)

    if target_idx != current_idx and target_idx != current_idx + 1:
      return Response({
        'success': False,
        'message': f"Invalid status transition from '{crime.status}' to '{target_status}'. Status must strictly follow flow: {' → '.join(STATUS_ORDER)}"
      }, status=status.HTTP_400_BAD_REQUEST)

    crime.status = target_status
    crime.save()

    # Notify officer
    if crime.officer and crime.officer.user:
      notify(crime.officer.user, 'New Case Assigned', f"Status of Case {crime.crime_id} updated to: {target_status}")

    return Response({
      'success': True,
      'status': crime.status,
      'isPending': crime.is_pending,
      'crime': self.get_serializer(crime).data
    })

  # Shortcut solve/close view
  @action(detail=True, methods=['patch'], url_path='close-solved', permission_classes=[IsOfficerOrAdminUser])
  def close_or_solve(self, request, pk=None):
    crime = self.get_object()
    target_status = request.data.get('status')

    if request.user.role == 'officer':
      officer = Officer.objects.filter(user=request.user).first()
      if not officer or crime.officer_id != officer.id:
        return Response({'success': False, 'message': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)

    if target_status not in ['Solved', 'Closed']:
      return Response({'success': False, 'message': 'Status must be either Solved or Closed'}, status=status.HTTP_400_BAD_REQUEST)

    crime.status = target_status
    crime.save()

    return Response({
      'success': True,
      'message': f'Case successfully marked as {target_status}',
      'crime': self.get_serializer(crime).data
    })

  # Append timeline notes
  @action(detail=True, methods=['post'], url_path='notes')
  def add_note(self, request, pk=None):
    crime = self.get_object()
    note_text = request.data.get('note')

    if not note_text:
      return Response({'success': False, 'message': 'Note content is required'}, status=status.HTTP_400_BAD_REQUEST)

    new_note = {
      'note': note_text,
      'addedBy_id': request.user.id,
      'addedBy_name': request.user.name,
      'created_at': datetime.datetime.now().isoformat()
    }

    # Notes field is JSONField list
    if not isinstance(crime.notes, list):
      crime.notes = []
    crime.notes.append(new_note)
    crime.save()

    return Response({'success': True, 'notes': crime.notes})

  # Custom Feature C: Similar/Related Case Finder logic
  @action(detail=True, methods=['get'], url_path='similar')
  def similar_cases(self, request, pk=None):
    source = self.get_object()
    
    stop_words = {'the', 'and', 'a', 'of', 'in', 'on', 'at', 'with', 'for', 'by', 'an', 'to', 'was', 'were', 'had', 'been', 'is', 'are'}
    source_words = [w.lower() for w in source.description.replace('.', '').replace(',', '').split() if len(w) > 3 and w.lower() not in stop_words]

    other_crimes = Crime.objects.exclude(id=source.id).select_related('crime_category', 'location')
    results = []

    for c in other_crimes:
      score = 0
      reasons = []

      # 1. Category check
      if c.crime_category_id == source.crime_category_id:
        score += 5
        reasons.append(f"Same crime type ({source.crime_category.name})")

      # 2. Location proximity check
      if c.location.police_station.lower() == source.location.police_station.lower() and c.location.city.lower() == source.location.city.lower():
        score += 4
        reasons.append(f"Same police station jurisdiction ({source.location.police_station})")
      elif c.location.city.lower() == source.location.city.lower():
        score += 3
        reasons.append(f"Same city ({source.location.city})")
      elif c.location.district.lower() == source.location.district.lower():
        score += 2
        reasons.append(f"Same district ({source.location.district})")

      # 3. Timing difference check
      days_diff = abs((c.date - source.date).days)
      if days_diff <= 30:
        score += 3
        reasons.append(f"Date proximity within 30 days ({days_diff} days apart)")
      elif days_diff <= 90:
        score += 1
        reasons.append(f"Date proximity within 90 days ({days_diff} days apart)")

      # 4. Text keyword check
      c_desc_lower = c.description.lower()
      matched_words = []
      for word in source_words:
        if word in c_desc_lower:
          matched_words.append(word)

      if matched_words:
        score += min(len(matched_words), 4) # cap score
        reasons.append(f"Similar details matching keywords: {', '.join(matched_words[:3])}")

      if score > 0:
        results.append({
          'crime': c,
          'similarityScore': score,
          'similarityReasons': reasons
        })

    # Sort descending and take top 10
    results.sort(key=lambda x: x['similarityScore'], reverse=True)
    results = results[:10]

    # Serialize nested crimes
    serialized_results = []
    for r in results:
      serialized_results.append({
        'crime': self.get_serializer(r['crime']).data,
        'similarityScore': r['similarityScore'],
        'similarityReasons': r['similarityReasons']
      })

    return Response({
      'success': True,
      'count': len(serialized_results),
      'results': serialized_results
    })


class SuspectViewSet(viewsets.ModelViewSet):
  queryset = Suspect.objects.all().order_by('-created_at')
  serializer_class = SuspectSerializer
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def list(self, request, *args, **kwargs):
    queryset = self.filter_queryset(self.get_queryset())
    serializer = self.get_serializer(queryset, many=True)
    return Response({'success': True, 'count': len(serializer.data), 'suspects': serializer.data})

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance)
    return Response({'success': True, 'suspect': serializer.data})

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    return Response({'success': True, 'suspect': serializer.data}, status=status.HTTP_201_CREATED)

  def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response({'success': True, 'suspect': serializer.data})

  def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response({'success': True, 'message': 'Suspect profile deleted successfully'})

  def perform_create(self, serializer):
    suspect = serializer.save()
    self.sync_suspect_cases(suspect.name)

  def perform_update(self, serializer):
    suspect = serializer.save()
    self.sync_suspect_cases(suspect.name)

  def perform_destroy(self, instance):
    name = instance.name
    instance.delete()
    self.sync_suspect_cases(name)

  def sync_suspect_cases(self, suspect_name):
    # Bidirectional links for suspects with same name
    matches = Suspect.objects.filter(name__iexact=suspect_name)
    if matches.count() <= 1:
      return

    all_crime_ids = list(set(matches.values_list('linked_crime_id', flat=True)))
    for suspect in matches:
      other_crimes = [cid for cid in all_crime_ids if cid != suspect.linked_crime_id]
      suspect.previous_cases.set(other_crimes)


class VictimViewSet(viewsets.ModelViewSet):
  queryset = Victim.objects.all().order_by('-created_at')
  serializer_class = VictimSerializer
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def list(self, request, *args, **kwargs):
    queryset = self.filter_queryset(self.get_queryset())
    serializer = self.get_serializer(queryset, many=True)
    return Response({'success': True, 'count': len(serializer.data), 'victims': serializer.data})

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance)
    return Response({'success': True, 'victim': serializer.data})

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    return Response({'success': True, 'victim': serializer.data}, status=status.HTTP_201_CREATED)

  def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response({'success': True, 'victim': serializer.data})

  def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response({'success': True, 'message': 'Victim record deleted successfully'})


class EvidenceViewSet(viewsets.ModelViewSet):
  queryset = Evidence.objects.all().order_by('-created_at')
  serializer_class = EvidenceSerializer
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def list(self, request, *args, **kwargs):
    queryset = self.filter_queryset(self.get_queryset())
    serializer = self.get_serializer(queryset, many=True)
    return Response({'success': True, 'count': len(serializer.data), 'evidence': serializer.data})

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance)
    return Response({'success': True, 'evidence': serializer.data})

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    return Response({'success': True, 'evidence': serializer.data}, status=status.HTTP_201_CREATED)

  def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response({'success': True, 'evidence': serializer.data})

  def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response({'success': True, 'message': 'Evidence record deleted successfully'})

  def perform_create(self, serializer):
    # File upload handling (if passed in request files)
    file_obj = self.request.FILES.get('file')
    if file_obj:
      serializer.save(file_path=f"/uploads/{file_obj.name}")
    else:
      serializer.save()


class NotificationViewSet(viewsets.ViewSet):
  permission_classes = [permissions.IsAuthenticated]

  def list(self, request):
    notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
    serializer = NotificationSerializer(notifications, many=True)
    return Response({
      'success': True,
      'count': len(serializer.data),
      'notifications': serializer.data
    })

  @action(detail=True, methods=['patch'], url_path='read')
  def mark_read(self, request, pk=None):
    notification = Notification.objects.filter(id=pk, recipient=request.user).first()
    if not notification:
      return Response({'success': False, 'message': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    notification.read = True
    notification.save()
    return Response({'success': True, 'notification': NotificationSerializer(notification).data})

  @action(detail=False, methods=['patch'], url_path='read-all')
  def mark_all_read(self, request):
    Notification.objects.filter(recipient=request.user, read=False).update(read=True)
    return Response({'success': True, 'message': 'All notifications marked as read'})


from rest_framework.parsers import MultiPartParser, FormParser
from django.core.mail import send_mail
from django.conf import settings
import secrets

def send_confirmation_email(citizen_name, email, fir_number, station_name, category, date_val):
  subject = f"CrimePilot FIR Submission Confirmation - {fir_number}"
  message = f"""Dear {citizen_name},

Thank you for using the CrimePilot Digital Crime Intelligence Platform. Your digital FIR has been submitted successfully.

FIR Reference Details:
-----------------------------------------
FIR Number: {fir_number}
Category: {category}
Date of Submission: {date_val}
Assigned Police Station: {station_name}
Status: Reported

You can track the progress of your investigation by logging into your Citizen Dashboard at any time.

Thank you,
CrimePilot Command Center
"""
  try:
    send_mail(
      subject,
      message,
      settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'no-reply@crimepilot.com',
      [email],
      fail_silently=True
    )
  except Exception as e:
    print("Email sending failed:", e)


class CitizenFIRSubmitView(APIView):
  permission_classes = [permissions.IsAuthenticated]
  parser_classes = [MultiPartParser, FormParser]

  def post(self, request):
    from authentication.models import Citizen
    citizen = Citizen.objects.filter(user=request.user).first()
    if not citizen:
      return Response({'success': False, 'message': 'Citizen profile not found'}, status=status.HTTP_404_NOT_FOUND)

    # To be flexible for tests but compliant, verify verification status
    if citizen.status != 'verified':
      return Response({'success': False, 'message': 'Your account is pending verification. Only verified citizens can submit digital FIRs.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    category_name = data.get('crimeCategory')
    date_val = data.get('date')
    time_val = data.get('time')
    description = data.get('description')
    priority = data.get('priority', 'Medium')
    
    state = data.get('state')
    city = data.get('city')
    district = data.get('district', 'Central')
    police_station = data.get('police_station')

    if not category_name or not date_val or not time_val or not description or not state or not city or not police_station:
      return Response({'success': False, 'message': 'Missing required fields for FIR registration'}, status=status.HTTP_400_BAD_REQUEST)

    category = CrimeCategory.objects.filter(name__iexact=category_name).first()
    if not category:
      category = CrimeCategory.objects.first()

    location, _ = Location.objects.get_or_create(
      state=state,
      city=city,
      district=district,
      police_station=police_station
    )

    officer = Officer.objects.filter(station=location).first()
    if not officer:
      officer = Officer.objects.first()

    if not officer:
      return Response({'success': False, 'message': 'No registered officer available to assign this case.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
      parsed_date = datetime.datetime.strptime(date_val, '%Y-%m-%d').date()
    except Exception:
      parsed_date = datetime.date.today()

    crime = Crime.objects.create(
      crime_category=category,
      date=parsed_date,
      time=time_val,
      location=location,
      description=description,
      officer=officer,
      citizen=citizen,
      priority=priority if priority in ['Low', 'Medium', 'High', 'Critical'] else 'Medium',
      status='Reported'
    )

    # Evidence uploads
    for field_name in ['photo', 'video', 'document']:
      file_obj = request.FILES.get(field_name)
      if file_obj:
        ext = os.path.splitext(file_obj.name)[1].lower()
        filename = f"ev-{secrets.token_hex(4)}{ext}"
        uploads_dir = os.path.join(settings.BASE_DIR, 'uploads')
        if not os.path.exists(uploads_dir):
          os.makedirs(uploads_dir)
        with open(os.path.join(uploads_dir, filename), 'wb+') as dest:
          for chunk in file_obj.chunks():
            dest.write(chunk)
        Evidence.objects.create(
          type=field_name.upper(),
          description=f"Evidence submitted by citizen during FIR registration.",
          collection_date=datetime.date.today(),
          assigned_officer=officer,
          linked_crime=crime,
          file_path=f"/uploads/{filename}"
        )

    # Notifications
    notify(officer.user, 'New Case Assigned', f'New Case {crime.crime_id} has been automatically assigned to you.')
    notify(request.user, 'High Priority Alert', f'Your FIR {crime.crime_id} has been submitted successfully.')

    # SMTP Mail
    send_confirmation_email(
      citizen_name=request.user.name,
      email=request.user.email,
      fir_number=crime.crime_id,
      station_name=location.police_station,
      category=category.name,
      date_val=crime.created_at.strftime('%Y-%m-%d') if crime.created_at else date_val
    )

    return Response({
      'success': True,
      'message': 'FIR submitted successfully.',
      'crimeId': crime.crime_id,
      'crime': CrimeSerializer(crime).data
    }, status=status.HTTP_201_CREATED)


class CitizenFIRListView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def get(self, request):
    from authentication.models import Citizen
    citizen = Citizen.objects.filter(user=request.user).first()
    if not citizen:
      return Response({'success': False, 'message': 'Citizen profile not found'}, status=status.HTTP_404_NOT_FOUND)
    crimes = Crime.objects.filter(citizen=citizen).order_by('-created_at')
    return Response({
      'success': True,
      'crimes': CrimeSerializer(crimes, many=True).data
    })


class CitizenEvidenceUploadView(APIView):
  permission_classes = [permissions.IsAuthenticated]
  parser_classes = [MultiPartParser, FormParser]

  def post(self, request, crime_pk=None):
    from authentication.models import Citizen
    citizen = Citizen.objects.filter(user=request.user).first()
    if not citizen:
      return Response({'success': False, 'message': 'Citizen profile not found'}, status=status.HTTP_404_NOT_FOUND)

    crime = Crime.objects.filter(id=crime_pk, citizen=citizen).first()
    if not crime:
      return Response({'success': False, 'message': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)

    file_obj = request.FILES.get('file')
    if not file_obj:
      return Response({'success': False, 'message': 'No evidence file provided'}, status=status.HTTP_400_BAD_REQUEST)

    ext = os.path.splitext(file_obj.name)[1].lower()
    filename = f"ev-{secrets.token_hex(4)}{ext}"
    uploads_dir = os.path.join(settings.BASE_DIR, 'uploads')
    if not os.path.exists(uploads_dir):
      os.makedirs(uploads_dir)
    with open(os.path.join(uploads_dir, filename), 'wb+') as dest:
      for chunk in file_obj.chunks():
        dest.write(chunk)

    evidence = Evidence.objects.create(
      type='CITIZEN_UPLOAD',
      description='Additional evidence uploaded by citizen.',
      collection_date=datetime.date.today(),
      assigned_officer=crime.officer,
      linked_crime=crime,
      file_path=f"/uploads/{filename}"
    )

    # Notify officer
    notify(crime.officer.user, 'High Priority Alert', f'Citizen uploaded additional evidence file for case {crime.crime_id}.')

    return Response({
      'success': True,
      'message': 'Additional evidence uploaded successfully.',
      'evidence': EvidenceSerializer(evidence).data
    })


class CitizenDownloadFIRView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def get(self, request, crime_pk=None):
    from authentication.models import Citizen
    citizen = Citizen.objects.filter(user=request.user).first()
    if not citizen:
      return Response({'success': False, 'message': 'Citizen profile not found'}, status=status.HTTP_404_NOT_FOUND)

    # Allow citizen, officer, or admin to download
    crime = Crime.objects.filter(id=crime_pk).first()
    if not crime:
      return Response({'success': False, 'message': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="FIR-{crime.crime_id}.pdf"'

    generate_report_pdf(
      response,
      f"FIR DETAILS COMPILATION - {crime.crime_id}",
      f"Submitted by citizen: {citizen.user.name}",
      [crime],
      f"Date Filed: {crime.date}"
    )
    return response


class AdminCitizenListView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsOfficerOrAdminUser]

  def get(self, request):
    from authentication.models import Citizen
    from authentication.serializers import CitizenSerializer
    citizens = Citizen.objects.all().order_by('-created_at')
    return Response({
      'success': True,
      'citizens': CitizenSerializer(citizens, many=True).data
    })


class AdminVerifyCitizenView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsOfficerOrAdminUser]

  def post(self, request, citizen_pk=None):
    from authentication.models import Citizen
    citizen = Citizen.objects.filter(id=citizen_pk).first()
    if not citizen:
      return Response({'success': False, 'message': 'Citizen profile not found'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action') # 'verify' or 'reject'
    if action == 'verify':
      citizen.status = 'verified'
    elif action == 'reject':
      citizen.status = 'rejected'
    else:
      return Response({'success': False, 'message': 'Invalid action parameters'}, status=status.HTTP_400_BAD_REQUEST)

    citizen.save()
    # Notify user
    notify(citizen.user, 'High Priority Alert', f'Your account verification status has been updated to: {citizen.get_status_display()}')

    return Response({
      'success': True,
      'message': f'Citizen verification status set to: {citizen.status}'
    })
