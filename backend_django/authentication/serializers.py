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
    rep['isActive'] = rep.pop('is_active')
    rep['createdAt'] = instance.created_at
    if 'profile_picture' in rep:
      rep['profilePicture'] = rep.pop('profile_picture')
    return rep

class OfficerSerializer(serializers.ModelSerializer):
  user = UserSerializer(read_only=True)

  class Meta:
    model = Officer
    fields = ('id', 'user', 'badge_no', 'station', 'contact', 'profile_picture', 'created_at')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    if 'badge_no' in rep:
      rep['badgeNo'] = rep.pop('badge_no')
    
    if 'profile_picture' in rep:
      rep['profilePicture'] = rep.pop('profile_picture')
    
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
    if 'profile_picture' in rep:
      rep['profilePicture'] = rep.pop('profile_picture')
    return rep

from .models import Citizen

class CitizenSerializer(serializers.ModelSerializer):
  user = UserSerializer(read_only=True)

  class Meta:
    model = Citizen
    fields = (
      'id', 'user', 'mobile', 'dob', 'gender', 'address', 'state', 'city', 'pincode', 
      'identity_type', 'identity_number', 'identity_document', 'status', 'created_at'
    )

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    if 'dob' in rep and instance.dob:
      rep['dob'] = instance.dob.strftime('%Y-%m-%d')
    if 'identity_type' in rep:
      rep['identityType'] = rep.pop('identity_type')
    if 'identity_number' in rep:
      rep['identityNumber'] = rep.pop('identity_number')
    if 'identity_document' in rep:
      rep['identityDocument'] = rep.pop('identity_document')
    return rep
