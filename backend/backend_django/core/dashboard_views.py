import datetime
import io
from django.db.models import Count
from django.db.models.functions import ExtractYear, ExtractMonth
from django.http import HttpResponse, FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from collections import Counter

from authentication.models import Officer, CustomUser
from authentication.serializers import OfficerSerializer
from .models import Location, CrimeCategory, Crime
from .serializers import CrimeSerializer
from .utils import generate_report_pdf
from authentication.permissions import IsStaffUser, IsAdminUser, IsOfficerOrAdminUser

class OfficerDashboardView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsOfficerOrAdminUser]

  def get(self, request):
    # Find officer profile for logged-in user
    officer = Officer.objects.filter(user=request.user).first()
    if not officer:
      return Response({'success': False, 'message': 'Officer profile not found'}, status=status.HTTP_404_NOT_FOUND)

    total_assigned = Crime.objects.filter(officer=officer).count()
    pending_count = Crime.objects.filter(
      officer=officer, 
      status__in=['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected']
    ).count()
    solved_count = total_assigned - pending_count

    recent_cases = Crime.objects.filter(officer=officer).order_by('-created_at')[:5]
    recent_serialized = CrimeSerializer(recent_cases, many=True).data

    return Response({
      'success': True,
      'stats': {
        'totalAssigned': total_assigned,
        'pendingCount': pending_count,
        'solvedCount': solved_count
      },
      'recentCases': recent_serialized
    }, status=status.HTTP_200_OK)

class AnalystDashboardView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def get(self, request):
    total_crimes = Crime.objects.count()
    solved_count = Crime.objects.filter(status__in=['Solved', 'Closed']).count()
    pending_count = total_crimes - solved_count

    # Category distribution
    categories = Crime.objects.values('crime_category__name', 'crime_category_id').annotate(count=Count('id')).order_by('-count')
    category_stats = [{
      'id': c['crime_category_id'],
      'name': c['crime_category__name'],
      'count': c['count']
    } for c in categories]

    # Hotspots distribution
    hotspots = Crime.objects.values(
      'location__state', 'location__district', 'location__city', 'location__police_station', 'location_id'
    ).annotate(count=Count('id')).order_by('-count')[:10]
    
    hotspot_stats = [{
      'id': h['location_id'],
      'state': h['location__state'],
      'district': h['location__district'],
      'city': h['location__city'],
      'policeStation': h['location__police_station'],
      'count': h['count']
    } for h in hotspots]

    # Monthly trends (last 12 months)
    monthly = Crime.objects.annotate(
      year=ExtractYear('date'),
      month=ExtractMonth('date')
    ).values('year', 'month').annotate(count=Count('id')).order_by('-year', '-month')[:12]
    
    monthly_trends = [{
      '_id': {'year': m['year'], 'month': m['month']},
      'count': m['count']
    } for m in monthly]

    # Peak hours (based on 'time' field HH:MM)
    times = Crime.objects.values_list('time', flat=True)
    hours = [t.split(':')[0] for t in times if t and ':' in t]
    hour_counts = Counter(hours)
    hour_stats = [{'id': h, 'count': c} for h, c in hour_counts.most_common(5)]
    # Match schema expectations of frontend
    for item in hour_stats:
      item['_id'] = item.pop('id')

    solved_rate_pct = f"{((solved_count / total_crimes) * 100):.2f}%" if total_crimes > 0 else "0%"

    return Response({
      'success': True,
      'summary': {
        'totalCrimes': total_crimes,
        'solvedCount': solved_count,
        'pendingCount': pending_count,
        'solvedRate': solved_rate_pct
      },
      'categoryStats': category_stats,
      'hotspotStats': hotspot_stats,
      'monthlyTrends': monthly_trends,
      'hourStats': hour_stats
    }, status=status.HTTP_200_OK)

class AdminDashboardView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsAdminUser]

  def get(self, request):
    total_users = CustomUser.objects.count()
    active_users = CustomUser.objects.filter(is_active=True).count()
    
    active_officer_ids = CustomUser.objects.filter(role='officer', is_active=True).values_list('id', flat=True)
    active_officers = Officer.objects.filter(user_id__in=active_officer_ids).count()

    active_cases = Crime.objects.filter(
      status__in=['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected']
    ).count()
    solved_cases = Crime.objects.filter(status__in=['Solved', 'Closed']).count()

    return Response({
      'success': True,
      'stats': {
        'totalUsers': total_users,
        'activeUsers': active_users,
        'activeOfficers': active_officers,
        'activeCases': active_cases,
        'solvedCases': solved_cases
      }
    }, status=status.HTTP_200_OK)

class ReportView(APIView):
  permission_classes = [permissions.IsAuthenticated, IsStaffUser]

  def get(self, request):
    start_date = request.query_params.get('startDate')
    end_date = request.query_params.get('endDate')
    report_format = request.query_params.get('fileFormat')
    priority = request.query_params.get('priority')
    status_filter = request.query_params.get('status')

    today_str = datetime.date.today().isoformat()

    if start_date and start_date > today_str:
      return Response({'success': False, 'message': "Start Date cannot be greater than today's date."}, status=status.HTTP_400_BAD_REQUEST)
    if end_date and end_date > today_str:
      return Response({'success': False, 'message': "End Date cannot be greater than today's date."}, status=status.HTTP_400_BAD_REQUEST)
    if start_date and end_date and end_date < start_date:
      return Response({'success': False, 'message': "End Date must be greater than or equal to Start Date."}, status=status.HTTP_400_BAD_REQUEST)

    crimes = Crime.objects.all().select_related('crime_category', 'location').order_by('date')

    if start_date:
      crimes = crimes.filter(date__gte=start_date)
    if end_date:
      crimes = crimes.filter(date__lte=end_date)
    if priority:
      crimes = crimes.filter(priority=priority)
    if status_filter:
      crimes = crimes.filter(status=status_filter)

    period_str = f"{start_date or 'Beginning'} to {end_date or 'Present'}"

    # Return PDF format download using FileResponse
    if report_format == 'pdf':
      now = datetime.datetime.now()
      filename = f"CrimePilot_Report_{now.strftime('%Y-%m-%d_%H-%M')}.pdf"

      buffer = io.BytesIO()
      generate_report_pdf(
        buffer,
        'Crime Cases Compilation Report',
        f'Generated from filter criteria. Total cases matched: {crimes.count()}',
        crimes,
        period_str
      )
      buffer.seek(0)

      response = FileResponse(buffer, as_attachment=True, filename=filename, content_type='application/pdf')
      response['Access-Control-Expose-Headers'] = 'Content-Disposition'
      return response

    # Return JSON (default)
    serializer = CrimeSerializer(crimes, many=True)
    return Response({
      'success': True,
      'period': period_str,
      'count': len(serializer.data),
      'crimes': serializer.data
    }, status=status.HTTP_200_OK)
