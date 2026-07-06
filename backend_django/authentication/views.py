import secrets
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import hashlib
import os

from .models import Officer, Analyst
from .serializers import OfficerSerializer, AnalystSerializer
from .permissions import IsAdminUser

User = get_user_model()

class LoginView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    username_or_email = request.data.get('usernameOrEmail')
    password = request.data.get('password')

    if not username_or_email or not password:
      return Response(
        {'success': False, 'message': 'Please provide email/username and password'},
        status=status.HTTP_400_BAD_REQUEST
      )

    user = User.objects.filter(email__iexact=username_or_email).first()
    if not user:
      user = User.objects.filter(name=username_or_email).first()

    if not user:
      return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
      return Response({'success': False, 'message': 'Your account is deactivated'}, status=status.HTTP_403_FORBIDDEN)

    if not user.check_password(password):
      return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Generate JWT
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    # Retrieve role-specific profiles
    details_data = None
    if user.role == 'officer':
      officer = Officer.objects.filter(user=user).first()
      if officer:
        details_data = OfficerSerializer(officer).data
    elif user.role == 'analyst':
      analyst = Analyst.objects.filter(user=user).first()
      if analyst:
        details_data = AnalystSerializer(analyst).data
    elif user.role == 'citizen':
      from .models import Citizen
      from .serializers import CitizenSerializer
      citizen = Citizen.objects.filter(user=user).first()
      if citizen:
        details_data = CitizenSerializer(citizen).data

    return Response({
      'success': True,
      'token': access_token,
      'user': {
        '_id': str(user.id),
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'isActive': user.is_active,
      },
      'details': details_data
    }, status=status.HTTP_200_OK)

class SignupView(APIView):
  permission_classes = [IsAuthenticated, IsAdminUser]

  def post(self, request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'officer')

    if not email or not name or not password:
      return Response(
        {'success': False, 'message': 'Name, email, and password are required'},
        status=status.HTTP_400_BAD_REQUEST
      )

    if User.objects.filter(email__iexact=email).exists():
      return Response({'success': False, 'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
      email=email,
      name=name,
      password=password,
      role=role
    )

    details_data = None
    try:
      if role == 'officer':
        badge_no = data.get('badgeNo')
        station_id = data.get('station')
        contact = data.get('contact')

        if not badge_no or not station_id or not contact:
          user.delete()
          return Response(
            {'success': False, 'message': 'Officer requires badgeNo, station, and contact'},
            status=status.HTTP_400_BAD_REQUEST
          )

        officer = Officer.objects.create(
          user=user,
          badge_no=badge_no,
          station_id=station_id,
          contact=contact
        )
        details_data = OfficerSerializer(officer).data

      elif role == 'analyst':
        department = data.get('department')
        if not department:
          user.delete()
          return Response(
            {'success': False, 'message': 'Analyst requires department'},
            status=status.HTTP_400_BAD_REQUEST
          )

        analyst = Analyst.objects.create(
          user=user,
          department=department
        )
        details_data = AnalystSerializer(analyst).data

    except Exception as e:
      user.delete()
      return Response({'success': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
      'success': True,
      'message': f'{role.upper()} registered successfully',
      'user': {
        '_id': str(user.id),
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'isActive': user.is_active,
      },
      'details': details_data
    }, status=status.HTTP_201_CREATED)

class ForgotPasswordView(APIView):
  permission_classes = [AllowAny]

  def post(self, request):
    email = request.data.get('email')
    if not email:
      return Response({'success': False, 'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email__iexact=email).first()
    if not user:
      return Response({'success': False, 'message': 'User not found with this email'}, status=status.HTTP_404_NOT_FOUND)

    raw_token = secrets.token_hex(20)
    hashed_token = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

    user.reset_password_token = hashed_token
    user.reset_password_expire = timezone.now() + timedelta(minutes=10)
    user.save()

    print(f"Password reset token for {user.email}: {raw_token}")

    reset_url = f"{request.scheme}://{request.get_host()}/api/auth/reset-password/{raw_token}"

    return Response({
      'success': True,
      'message': 'Token generated and printed to console / returned in response',
      'resetToken': raw_token,
      'resetUrl': reset_url
    }, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
  permission_classes = [AllowAny]

  def post(self, request, token):
    password = request.data.get('password')
    if not password:
      return Response({'success': False, 'message': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

    hashed_token = hashlib.sha256(token.encode('utf-8')).hexdigest()

    user = User.objects.filter(
      reset_password_token=hashed_token,
      reset_password_expire__gt=timezone.now()
    ).first()

    if not user:
      return Response({'success': False, 'message': 'Invalid or expired reset token'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.reset_password_token = None
    user.reset_password_expire = None
    user.save()

    return Response({
      'success': True,
      'message': 'Password reset successful'
    }, status=status.HTTP_200_OK)

class ProfilePictureView(APIView):
  permission_classes = [IsAuthenticated]
  parser_classes = (MultiPartParser, FormParser)

  def post(self, request):
    file_obj = request.FILES.get('file')
    if not file_obj:
      return Response({'success': False, 'message': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

    uploads_dir = os.path.join(settings.BASE_DIR, 'uploads')
    if not os.path.exists(uploads_dir):
      os.makedirs(uploads_dir)

    ext = os.path.splitext(file_obj.name)[1]
    filename = f"profile-{request.user.id}-{int(timezone.now().timestamp())}{ext}"
    file_path = os.path.join(uploads_dir, filename)

    with open(file_path, 'wb+') as destination:
      for chunk in file_obj.chunks():
        destination.write(chunk)

    db_path = f"/uploads/{filename}"
    
    # Save to user directly
    request.user.profile_picture = db_path
    request.user.save()

    details_data = None
    if request.user.role == 'officer':
      officer = Officer.objects.filter(user=request.user).first()
      if officer:
        officer.profile_picture = db_path
        officer.save()
        details_data = OfficerSerializer(officer).data
    elif request.user.role == 'analyst':
      analyst = Analyst.objects.filter(user=request.user).first()
      if analyst:
        analyst.profile_picture = db_path
        analyst.save()
        details_data = AnalystSerializer(analyst).data
    elif request.user.role == 'citizen':
      from .models import Citizen
      from .serializers import CitizenSerializer
      citizen = Citizen.objects.filter(user=request.user).first()
      if citizen:
        details_data = CitizenSerializer(citizen).data
    elif request.user.role == 'admin':
      details_data = {}

    if details_data is None:
      return Response({'success': False, 'message': 'Profile details not found'}, status=status.HTTP_404_NOT_FOUND)

    from authentication.serializers import UserSerializer
    return Response({
      'success': True,
      'message': 'Profile picture uploaded successfully',
      'user': UserSerializer(request.user).data,
      'details': details_data
    }, status=status.HTTP_200_OK)

  def delete(self, request):
    # Save to user directly
    request.user.profile_picture = None
    request.user.save()

    details_data = None
    if request.user.role == 'officer':
      officer = Officer.objects.filter(user=request.user).first()
      if officer:
        officer.profile_picture = None
        officer.save()
        details_data = OfficerSerializer(officer).data
    elif request.user.role == 'analyst':
      analyst = Analyst.objects.filter(user=request.user).first()
      if analyst:
        analyst.profile_picture = None
        analyst.save()
        details_data = AnalystSerializer(analyst).data
    elif request.user.role == 'citizen':
      from .models import Citizen
      from .serializers import CitizenSerializer
      citizen = Citizen.objects.filter(user=request.user).first()
      if citizen:
        details_data = CitizenSerializer(citizen).data
    elif request.user.role == 'admin':
      details_data = {}

    if details_data is None:
      return Response({'success': False, 'message': 'Profile details not found'}, status=status.HTTP_404_NOT_FOUND)

    from authentication.serializers import UserSerializer
    return Response({
      'success': True,
      'message': 'Profile picture deleted successfully',
      'user': UserSerializer(request.user).data,
      'details': details_data
    }, status=status.HTTP_200_OK)


class CitizenSignupView(APIView):
  permission_classes = [AllowAny]
  parser_classes = [MultiPartParser, FormParser]

  def post(self, request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    mobile = data.get('mobile')
    dob = data.get('dob')
    gender = data.get('gender')
    address = data.get('address')
    state = data.get('state')
    city = data.get('city')
    pincode = data.get('pincode')
    identity_type = data.get('identityType')
    identity_number = data.get('identityNumber')

    if not email or not name or not password or not mobile or not identity_type or not identity_number:
      return Response(
        {'success': False, 'message': 'Required fields: Full Name, Email, Password, Mobile, Identity Type, Identity Number'},
        status=status.HTTP_400_BAD_REQUEST
      )

    if User.objects.filter(email__iexact=email).exists():
      return Response({'success': False, 'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    # File validation
    id_doc = request.FILES.get('identityDocument')
    db_path = ''
    if id_doc:
      if id_doc.size > 5 * 1024 * 1024:
        return Response({'success': False, 'message': 'Identity proof file exceeds 5MB limit'}, status=status.HTTP_400_BAD_REQUEST)
      ext = os.path.splitext(id_doc.name)[1].lower()
      if ext not in ['.jpg', '.jpeg', '.png', '.pdf']:
        return Response({'success': False, 'message': 'Accepted formats: JPG, PNG, PDF'}, status=status.HTTP_400_BAD_REQUEST)

      uploads_dir = os.path.join(settings.BASE_DIR, 'uploads')
      if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
      
      filename = f"id-{secrets.token_hex(4)}{ext}"
      file_path = os.path.join(uploads_dir, filename)
      with open(file_path, 'wb+') as destination:
        for chunk in id_doc.chunks():
          destination.write(chunk)
      db_path = f"/uploads/{filename}"

    try:
      user = User.objects.create_user(
        email=email,
        name=name,
        password=password,
        role='citizen'
      )
      
      from .models import Citizen
      from .serializers import CitizenSerializer

      citizen = Citizen.objects.create(
        user=user,
        mobile=mobile,
        dob=dob if dob else None,
        gender=gender,
        address=address,
        state=state,
        city=city,
        pincode=pincode,
        identity_type=identity_type,
        identity_number=identity_number,
        identity_document=db_path,
        status='pending'
      )
      
      details_data = CitizenSerializer(citizen).data
      
    except Exception as e:
      if 'user' in locals():
        user.delete()
      return Response({'success': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
      'success': True,
      'message': 'Citizen registered successfully. Account is pending verification.',
      'user': {
        '_id': str(user.id),
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'isActive': user.is_active,
      },
      'details': details_data
    }, status=status.HTTP_201_CREATED)
