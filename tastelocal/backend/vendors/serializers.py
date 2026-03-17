"""Serializers for vendor profiles."""
from rest_framework import serializers
from .models import VendorProfile, VendorPhoto
from accounts.serializers import UserPublicSerializer


class VendorPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorPhoto
        fields = ['id', 'image', 'caption', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class VendorProfileSerializer(serializers.ModelSerializer):
    """Full vendor profile serializer."""
    user = UserPublicSerializer(read_only=True)
    photos = VendorPhotoSerializer(many=True, read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    cuisine_type_display = serializers.CharField(
        source='get_cuisine_type_display', read_only=True
    )

    class Meta:
        model = VendorProfile
        fields = [
            'id', 'user', 'business_name', 'description', 'cuisine_type',
            'cuisine_type_display', 'address', 'latitude', 'longitude',
            'phone', 'website', 'email', 'opening_hours', 'cover_image',
            'logo', 'is_approved', 'is_featured', 'photos', 'avg_rating',
            'total_reviews', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_approved', 'is_featured', 'created_at', 'updated_at']


class VendorProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for vendor profile creation/update."""
    class Meta:
        model = VendorProfile
        fields = [
            'business_name', 'description', 'cuisine_type', 'address',
            'latitude', 'longitude', 'phone', 'website', 'email',
            'opening_hours', 'cover_image', 'logo'
        ]


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight vendor list serializer."""
    avg_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    cuisine_type_display = serializers.CharField(
        source='get_cuisine_type_display', read_only=True
    )

    class Meta:
        model = VendorProfile
        fields = [
            'id', 'business_name', 'cuisine_type', 'cuisine_type_display',
            'address', 'latitude', 'longitude', 'cover_image', 'logo',
            'avg_rating', 'total_reviews', 'is_featured'
        ]


class VendorMapSerializer(serializers.ModelSerializer):
    """Minimal serializer for map pins."""
    avg_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = VendorProfile
        fields = ['id', 'business_name', 'latitude', 'longitude',
                  'cuisine_type', 'cover_image', 'avg_rating']
