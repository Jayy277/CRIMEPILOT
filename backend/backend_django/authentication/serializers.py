from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Officer, Analyst

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'name', 'email', 'role', 'is_active', 'profile_picture', 'created_at')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    if 'is_active' in rep:
      rep['isActive'] = rep.pop('is_active')
    rep['createdAt'] = instance.created_at
    pic = instance.profile_picture
    rep['profile_picture'] = pic
    rep['profilePicture'] = pic
    rep['avatar'] = pic
      
    # Dynamic department field based on user role
    role = instance.role
    if role == 'officer':
      rep['department'] = 'Field Division'
    elif role == 'analyst':
      rep['department'] = 'Intelligence Division'
    elif role == 'admin':
      rep['department'] = 'Command Division'
    else:
      rep['department'] = None

    return rep


class OfficerSerializer(serializers.ModelSerializer):
  user = UserSerializer(read_only=True)

  class Meta:
    model = Officer
    fields = ('id', 'user', 'badge_no', 'station', 'contact', 'profile_picture', 'created_at')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    badge = instance.badge_no
    rep['badge_no'] = badge
    rep['badgeNo'] = badge
    rep['name'] = instance.user.name if instance.user else 'Officer'
    
    pic = instance.profile_picture or (instance.user.profile_picture if instance.user else None)
    rep['profile_picture'] = pic
    rep['profilePicture'] = pic
    rep['avatar'] = pic

    rep['total_cases'] = getattr(instance, 'total_cases', 0)
    rep['active_cases'] = getattr(instance, 'active_cases', 0)
    rep['resolved_cases'] = getattr(instance, 'resolved_cases', 0)
    
    # Populate station with Location details
    from core.serializers import LocationSerializer
    if instance.station:
      rep['station'] = LocationSerializer(instance.station).data
    else:
      rep['station'] = None

    return rep

class AnalystSerializer(serializers.ModelSerializer):
  user = UserSerializer(read_only=True)

  class Meta:
    model = Analyst
    fields = ('id', 'user', 'department', 'profile_picture', 'created_at')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    pic = instance.profile_picture or (instance.user.profile_picture if instance.user else None)
    rep['profile_picture'] = pic
    rep['profilePicture'] = pic
    rep['avatar'] = pic
    return rep

from .models import Citizen

class CitizenSerializer(serializers.ModelSerializer):
  user = UserSerializer(read_only=True)

  class Meta:
    model = Citizen
    fields = (
      'id', 'user', 'mobile', 'dob', 'gender', 'address', 'state', 'city', 'pincode', 
      'identity_type', 'identity_number', 'identity_document', 'status', 'profile_picture', 'created_at'
    )

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    if 'dob' in rep and instance.dob:
      # dob may be a date object or a plain string — handle both safely
      if hasattr(instance.dob, 'strftime'):
        rep['dob'] = instance.dob.strftime('%Y-%m-%d')
      else:
        rep['dob'] = str(instance.dob)
    if 'identity_type' in rep:
      rep['identityType'] = rep.pop('identity_type')
    if 'identity_number' in rep:
      rep['identityNumber'] = rep.pop('identity_number')
    if 'identity_document' in rep:
      rep['identityDocument'] = rep.pop('identity_document')
    
    pic = getattr(instance, 'profile_picture', None) or (instance.user.profile_picture if instance.user else None)
    rep['profile_picture'] = pic
    rep['profilePicture'] = pic
    rep['avatar'] = pic
    return rep
