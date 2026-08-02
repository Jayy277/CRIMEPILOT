from rest_framework import serializers
from .models import Location, CrimeCategory, Crime, Suspect, Victim, Evidence, Notification
from authentication.serializers import OfficerSerializer, UserSerializer

class LocationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Location
    fields = ('id', 'state', 'district', 'city', 'police_station')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    police_stn = instance.police_station
    rep['police_station'] = police_stn
    rep['policeStation'] = police_stn
    return rep

  def to_internal_value(self, data):
    if 'policeStation' in data:
      data['police_station'] = data.pop('policeStation')
    return super().to_internal_value(data)

class CrimeCategorySerializer(serializers.ModelSerializer):
  class Meta:
    model = CrimeCategory
    fields = ('id', 'name', 'sections')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    return rep

class CrimeSerializer(serializers.ModelSerializer):
  isPending = serializers.ReadOnlyField(source='is_pending')
  crimeId = serializers.ReadOnlyField(source='crime_id')
  
  crimeCategory = serializers.PrimaryKeyRelatedField(
    queryset=CrimeCategory.objects.all(), source='crime_category'
  )
  location = serializers.PrimaryKeyRelatedField(
    queryset=Location.objects.all()
  )
  officer = serializers.PrimaryKeyRelatedField(
    queryset=OfficerSerializer.Meta.model.objects.all()
  )

  class Meta:
    model = Crime
    fields = (
      'id', 'crimeId', 'crimeCategory', 'date', 'time', 'location', 
      'description', 'officer', 'priority', 'status', 'sections', 
      'notes', 'isPending', 'created_at', 'updated_at'
    )

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    cid = instance.crime_id or f"CR-{instance.created_at.year if hasattr(instance, 'created_at') and instance.created_at else 2026}-{instance.id:05d}"
    rep['crime_id'] = cid
    rep['crimeId'] = cid
    rep['firNumber'] = f"FIR-{cid}" if not cid.startswith('FIR-') else cid
    rep['fir_number'] = rep['firNumber']
    
    cat_data = CrimeCategorySerializer(instance.crime_category).data
    rep['crimeCategory'] = cat_data
    rep['crime_category'] = cat_data
    
    rep['location'] = LocationSerializer(instance.location).data
    rep['officer'] = OfficerSerializer(instance.officer).data
    rep['createdAt'] = instance.created_at
    rep['updatedAt'] = instance.updated_at
    return rep

class SuspectSerializer(serializers.ModelSerializer):
  linkedCrime = serializers.PrimaryKeyRelatedField(
    queryset=Crime.objects.all(), source='linked_crime'
  )
  previousCases = serializers.PrimaryKeyRelatedField(
    queryset=Crime.objects.all(), many=True, source='previous_cases', required=False
  )

  class Meta:
    model = Suspect
    fields = (
      'id', 'name', 'age', 'gender', 'address', 'photo_path', 
      'status', 'linkedCrime', 'previousCases', 'created_at'
    )

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    rep['photoPath'] = rep.pop('photo_path')
    rep['linkedCrime'] = CrimeSerializer(instance.linked_crime).data
    rep['previousCases'] = CrimeSerializer(instance.previous_cases.all(), many=True).data
    return rep

  def to_internal_value(self, data):
    if 'photoPath' in data:
      data['photo_path'] = data.pop('photoPath')
    return super().to_internal_value(data)

class VictimSerializer(serializers.ModelSerializer):
  linkedCrime = serializers.PrimaryKeyRelatedField(
    queryset=Crime.objects.all(), source='linked_crime'
  )
  evidenceReference = serializers.CharField(source='evidence_reference', required=False, allow_blank=True)

  class Meta:
    model = Victim
    fields = ('id', 'name', 'contact', 'statement', 'evidenceReference', 'linkedCrime', 'created_at')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    rep['linkedCrime'] = CrimeSerializer(instance.linked_crime).data
    return rep

class EvidenceSerializer(serializers.ModelSerializer):
  evidenceId = serializers.ReadOnlyField(source='evidence_id')
  assignedOfficer = serializers.PrimaryKeyRelatedField(
    queryset=OfficerSerializer.Meta.model.objects.all(), source='assigned_officer'
  )
  linkedCrime = serializers.PrimaryKeyRelatedField(
    queryset=Crime.objects.all(), source='linked_crime'
  )
  collectionDate = serializers.DateField(source='collection_date')
  filePath = serializers.CharField(source='file_path', required=False, allow_blank=True)

  class Meta:
    model = Evidence
    fields = (
      'id', 'evidenceId', 'type', 'description', 'collectionDate', 
      'assignedOfficer', 'linkedCrime', 'filePath', 'created_at'
    )

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    rep['assignedOfficer'] = OfficerSerializer(instance.assigned_officer).data
    rep['linkedCrime'] = CrimeSerializer(instance.linked_crime).data
    return rep

class NotificationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Notification
    fields = ('id', 'type', 'recipient', 'message', 'read', 'created_at')

  def to_representation(self, instance):
    rep = super().to_representation(instance)
    rep['_id'] = str(instance.id)
    rep['createdAt'] = instance.created_at
    return rep
