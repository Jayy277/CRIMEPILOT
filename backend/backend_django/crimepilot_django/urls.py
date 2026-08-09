from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
import os

def home_view(request):
    return JsonResponse({
        "status": "online",
        "message": "CrimePilot Django Backend API Server",
        "api_root": "/api/",
        "admin": "/admin/"
    })

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/auth/', include('authentication.urls')),
    path('api/', include('core.urls')),
]

from django.views.static import serve
from django.urls import re_path

uploads_path = getattr(settings, 'MEDIA_ROOT', os.path.join(settings.BASE_DIR, 'uploads'))
if not os.path.exists(uploads_path):
    os.makedirs(uploads_path)

urlpatterns += [
    re_path(r'^uploads/(?P<path>.*)$', serve, {'document_root': uploads_path}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': uploads_path}),
]


