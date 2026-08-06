from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter

from .views import (
  LocationViewSet, PoliceStationSearchView, CrimeCategoryViewSet, CrimeViewSet, 
  SuspectViewSet, VictimViewSet, EvidenceViewSet, NotificationViewSet,
  CitizenFIRSubmitView, CitizenFIRListView, CitizenFIRDetailView, CitizenEvidenceUploadView,
  CitizenDownloadFIRView, AdminCitizenListView, AdminVerifyCitizenView
)
from .dashboard_views import (
  OfficerDashboardView, AnalystDashboardView, AdminDashboardView, ReportView
)
from .admin_views import (
  AdminUsersListView, AdminUserDetailView, AdminUserToggleActiveView, 
  AdminStaffSearchView, AdminSystemLogsView
)
from .ai_views import AIChatView, AIPredictView
from authentication.views import CitizenSignupView

router = DefaultRouter(trailing_slash=False) # Keep URL compatibility matching Express paths

# Standard ViewSets
router.register('locations', LocationViewSet, basename='locations')
router.register('crime-categories', CrimeCategoryViewSet, basename='categories')
router.register('crimes', CrimeViewSet, basename='crimes')
router.register('suspects', SuspectViewSet, basename='suspects')
router.register('victims', VictimViewSet, basename='victims')
router.register('evidence', EvidenceViewSet, basename='evidence')

# Admin CRUD endpoints mapped for categories & locations
router.register('admin/crime-categories', CrimeCategoryViewSet, basename='admin-categories')
router.register('admin/locations', LocationViewSet, basename='admin-locations')

urlpatterns = [
  path('', include(router.urls)),

  # Search Police Stations Endpoint
  re_path(r'^police-stations/search/?$', PoliceStationSearchView.as_view(), name='police_stations_search'),

  # AI Assistant Conversational Endpoint
  re_path(r'^ai/chat/?$', AIChatView.as_view(), name='ai_chat'),
  re_path(r'^ai/predict/?$', AIPredictView.as_view(), name='ai_predict'),

  # Notification endpoints
  re_path(r'^notifications/?$', NotificationViewSet.as_view({'get': 'list'}), name='notifications_list'),
  re_path(r'^notifications/read-all/?$', NotificationViewSet.as_view({'patch': 'mark_all_read'}), name='notifications_read_all'),
  re_path(r'^notifications/(?P<pk>\d+)/read/?$', NotificationViewSet.as_view({'patch': 'mark_read'}), name='notifications_mark_read'),

  # Dashboard endpoints
  re_path(r'^dashboard/officer/?$', OfficerDashboardView.as_view(), name='dashboard_officer'),
  re_path(r'^dashboard/analyst/?$', AnalystDashboardView.as_view(), name='dashboard_analyst'),
  re_path(r'^dashboard/admin/?$', AdminDashboardView.as_view(), name='dashboard_admin'),
  re_path(r'^dashboard/report/?$', ReportView.as_view(), name='dashboard_report'),

  # Admin management endpoints
  re_path(r'^admin/users/?$', AdminUsersListView.as_view(), name='admin_users_list'),
  re_path(r'^admin/users/(?P<pk>\d+)/?$', AdminUserDetailView.as_view(), name='admin_user_detail'),
  re_path(r'^admin/users/(?P<pk>\d+)/toggle-active/?$', AdminUserToggleActiveView.as_view(), name='admin_user_toggle_active'),
  re_path(r'^admin/staff-search/?$', AdminStaffSearchView.as_view(), name='admin_staff_search'),
  re_path(r'^admin/logs/?$', AdminSystemLogsView.as_view(), name='admin_system_logs'),

  # Citizen routes
  re_path(r'^citizen/register/?$', CitizenSignupView.as_view(), name='citizen_register_core'),
  re_path(r'^citizen/fir/?$', CitizenFIRSubmitView.as_view(), name='citizen_fir_submit'),
  re_path(r'^citizen/my-cases/?$', CitizenFIRListView.as_view(), name='citizen_fir_list'),
  re_path(r'^citizen/cases/(?P<crime_pk>\d+)/?$', CitizenFIRDetailView.as_view(), name='citizen_fir_detail'),
  re_path(r'^citizen/cases/(?P<crime_pk>\d+)/evidence/?$', CitizenEvidenceUploadView.as_view(), name='citizen_evidence_upload'),
  re_path(r'^citizen/cases/(?P<crime_pk>\d+)/download/?$', CitizenDownloadFIRView.as_view(), name='citizen_fir_download'),
  
  # Admin citizen lists & verify
  re_path(r'^admin/citizens/?$', AdminCitizenListView.as_view(), name='admin_citizen_list'),
  re_path(r'^admin/citizens/(?P<citizen_pk>\d+)/verify/?$', AdminVerifyCitizenView.as_view(), name='admin_verify_citizen'),
]

