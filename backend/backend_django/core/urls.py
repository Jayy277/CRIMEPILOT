from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
  LocationViewSet, CrimeCategoryViewSet, CrimeViewSet, 
  SuspectViewSet, VictimViewSet, EvidenceViewSet, NotificationViewSet,
  CitizenFIRSubmitView, CitizenFIRListView, CitizenEvidenceUploadView,
  CitizenDownloadFIRView, AdminCitizenListView, AdminVerifyCitizenView
)
from .dashboard_views import (
  OfficerDashboardView, AnalystDashboardView, AdminDashboardView, ReportView
)
from .admin_views import (
  AdminUsersListView, AdminUserDetailView, AdminUserToggleActiveView, 
  AdminStaffSearchView, AdminSystemLogsView
)
from .ai_views import AIChatView
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

  # AI Assistant Conversational Endpoint
  path('ai/chat', AIChatView.as_view(), name='ai_chat'),

  # Notification endpoints
  path('notifications', NotificationViewSet.as_view({'get': 'list'}), name='notifications_list'),
  path('notifications/read-all', NotificationViewSet.as_view({'patch': 'mark_all_read'}), name='notifications_read_all'),
  path('notifications/<int:pk>/read', NotificationViewSet.as_view({'patch': 'mark_read'}), name='notifications_mark_read'),

  # Dashboard endpoints
  path('dashboard/officer', OfficerDashboardView.as_view(), name='dashboard_officer'),
  path('dashboard/analyst', AnalystDashboardView.as_view(), name='dashboard_analyst'),
  path('dashboard/admin', AdminDashboardView.as_view(), name='dashboard_admin'),
  path('dashboard/report', ReportView.as_view(), name='dashboard_report'),

  # Admin management endpoints
  path('admin/users', AdminUsersListView.as_view(), name='admin_users_list'),
  path('admin/users/<int:pk>', AdminUserDetailView.as_view(), name='admin_user_detail'),
  path('admin/users/<int:pk>/toggle-active', AdminUserToggleActiveView.as_view(), name='admin_user_toggle_active'),
  path('admin/staff-search', AdminStaffSearchView.as_view(), name='admin_staff_search'),
  path('admin/logs', AdminSystemLogsView.as_view(), name='admin_system_logs'),

  # Citizen routes
  path('citizen/register', CitizenSignupView.as_view(), name='citizen_register_core'),
  path('citizen/fir', CitizenFIRSubmitView.as_view(), name='citizen_fir_submit'),
  path('citizen/my-cases', CitizenFIRListView.as_view(), name='citizen_fir_list'),
  path('citizen/cases/<int:crime_pk>/evidence', CitizenEvidenceUploadView.as_view(), name='citizen_evidence_upload'),
  path('citizen/cases/<int:crime_pk>/download', CitizenDownloadFIRView.as_view(), name='citizen_fir_download'),
  
  # Admin citizen lists & verify
  path('admin/citizens', AdminCitizenListView.as_view(), name='admin_citizen_list'),
  path('admin/citizens/<int:citizen_pk>/verify', AdminVerifyCitizenView.as_view(), name='admin_verify_citizen'),
]
