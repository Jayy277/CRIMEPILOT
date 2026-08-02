from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q

from authentication.models import Officer, Analyst
from authentication.serializers import UserSerializer, OfficerSerializer, AnalystSerializer
from authentication.permissions import IsAdminUser
from logs.models import AuditLog
from logs.serializers import AuditLogSerializer

User = get_user_model()

class AdminUsersListView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsAdminUser]

  def get(self, request):
    role = request.query_params.get('role')
    active = request.query_params.get('active')
    search = request.query_params.get('search')

    queryset = User.objects.all().order_by('-created_at')

    if role:
      queryset = queryset.filter(role=role)
    if active:
      queryset = queryset.filter(is_active=(active == 'true'))
    if search:
      queryset = queryset.filter(Q(name__icontains=search) | Q(email__icontains=search))

    results = []
    for user in queryset:
      details = None
      if user.role == 'officer':
        officer = Officer.objects.filter(user=user).first()
        if officer:
          details = OfficerSerializer(officer).data
      elif user.role == 'analyst':
        analyst = Analyst.objects.filter(user=user).first()
        if analyst:
          details = AnalystSerializer(analyst).data
      
      results.append({
        'user': UserSerializer(user).data,
        'details': details
      })

    return Response({'success': True, 'users': results}, status=status.HTTP_200_OK)

class AdminUserDetailView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsAdminUser]

  def put(self, request, pk):
    user = User.objects.filter(id=pk).first()
    if not user:
      return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    name = data.get('name')
    email = data.get('email')
    is_active = data.get('isActive')
    role = data.get('role')

    if email and email.lower() != user.email.lower():
      if User.objects.filter(email__iexact=email).exclude(id=user.id).exists():
        return Response({'success': False, 'message': 'Email address is already registered to another user.'}, status=status.HTTP_400_BAD_REQUEST)

    # Domain validation checks
    target_role = role if role else user.role
    target_email = email if email else user.email
    email_lower = target_email.lower()
    if target_role in ['officer', 'analyst', 'admin']:
      if not email_lower.endswith('@crimepilot.com'):
        return Response({'success': False, 'message': 'Staff accounts must use mandatory domain @crimepilot.com'}, status=status.HTTP_400_BAD_REQUEST)
    elif target_role == 'citizen':
      if email_lower.endswith('@crimepilot.com'):
        return Response({'success': False, 'message': 'Citizen accounts cannot use @crimepilot.com domain'}, status=status.HTTP_400_BAD_REQUEST)


    if name: user.name = name
    if email: user.email = email
    if is_active is not None: user.is_active = is_active

    old_role = user.role
    if role and role != old_role:
      # Delete old profile
      if old_role == 'officer': Officer.objects.filter(user=user).delete()
      if old_role == 'analyst': Analyst.objects.filter(user=user).delete()

      user.role = role
      user.save()

      # Create new profile
      if role == 'officer':
        Officer.objects.create(
          user=user, 
          badge_no=data.get('badgeNo', f"BADGE-{int(timezone_now().timestamp())}"),
          station_id=data.get('station'),
          contact=data.get('contact', 'N/A')
        )
      elif role == 'analyst':
        Analyst.objects.create(
          user=user,
          department=data.get('department', 'General Analytics')
        )
    else:
      user.save()
      # Update existing profile
      if user.role == 'officer':
        officer = Officer.objects.filter(user=user).first()
        if officer:
          if 'badgeNo' in data: officer.badge_no = data.get('badgeNo')
          if 'station' in data: officer.station_id = data.get('station')
          if 'contact' in data: officer.contact = data.get('contact')
          officer.save()
      elif user.role == 'analyst':
        analyst = Analyst.objects.filter(user=user).first()
        if analyst:
          if 'department' in data: analyst.department = data.get('department')
          analyst.save()

    # Get updated details
    details_data = None
    if user.role == 'officer':
      officer = Officer.objects.filter(user=user).first()
      if officer: details_data = OfficerSerializer(officer).data
    elif user.role == 'analyst':
      analyst = Analyst.objects.filter(user=user).first()
      if analyst: details_data = AnalystSerializer(analyst).data

    return Response({
      'success': True,
      'message': 'User updated successfully',
      'user': UserSerializer(user).data,
      'details': details_data
    }, status=status.HTTP_200_OK)

  def delete(self, request, pk):
    user = User.objects.filter(id=pk).first()
    if not user:
      return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if user.id == request.user.id:
      return Response({'success': False, 'message': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)

    # Django Cascade deletes linked profiles automatically
    user.delete()
    return Response({'success': True, 'message': 'User deleted successfully'}, status=status.HTTP_200_OK)

class AdminUserToggleActiveView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsAdminUser]

  def patch(self, request, pk):
    user = User.objects.filter(id=pk).first()
    if not user:
      return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if user.id == request.user.id:
      return Response({'success': False, 'message': 'Cannot activate/deactivate your own account'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = not user.is_active
    user.save()

    status_str = "activated" if user.is_active else "deactivated"
    return Response({
      'success': True,
      'message': f'User account has been {status_str}',
      'isActive': user.is_active
    }, status=status.HTTP_200_OK)

class AdminStaffSearchView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsAdminUser]

  def get(self, request):
    name = request.query_params.get('name')
    role = request.query_params.get('role')
    badge_no = request.query_params.get('badgeNo')
    department = request.query_params.get('department')

    user_query = Q()
    if name:
      user_query &= Q(name__icontains=name)
    if role:
      user_query &= Q(role=role)
    else:
      user_query &= Q(role__in=['officer', 'analyst'])

    matched_users = User.objects.filter(user_query)
    user_ids = matched_users.values_list('id', flat=True)

    officers_data = []
    analysts_data = []

    if not role or role == 'officer':
      from django.db.models import Count
      officer_query = Q(user_id__in=user_ids)
      if badge_no:
        officer_query &= Q(badge_no__icontains=badge_no)
      officers = Officer.objects.filter(officer_query).select_related('user', 'station').annotate(
        total_cases=Count('crimes'),
        active_cases=Count('crimes', filter=~Q(crimes__status__in=['Solved', 'Closed'])),
        resolved_cases=Count('crimes', filter=Q(crimes__status__in=['Solved', 'Closed']))
      )
      officers_data = OfficerSerializer(officers, many=True).data

    if not role or role == 'analyst':
      analyst_query = Q(user_id__in=user_ids)
      if department:
        analyst_query &= Q(department__icontains=department)
      analysts = Analyst.objects.filter(analyst_query).select_related('user')
      analysts_data = AnalystSerializer(analysts, many=True).data

    return Response({
      'success': True,
      'officers': officers_data,
      'analysts': analysts_data
    }, status=status.HTTP_200_OK)

class AdminSystemLogsView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsAdminUser]

  def get(self, request):
    logs = AuditLog.objects.all().select_related('user').order_by('-timestamp')[:100]
    serializer = AuditLogSerializer(logs, many=True)
    return Response({'success': True, 'logs': serializer.data}, status=status.HTTP_200_OK)

def timezone_now():
  from django.utils import timezone
  return timezone.now()
