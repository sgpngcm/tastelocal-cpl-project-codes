"""Serializers for bookings."""
from rest_framework import serializers
from .models import Booking
from experiences.serializers import ExperienceListSerializer
from accounts.serializers import UserPublicSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'experience', 'booking_date', 'booking_time',
            'num_guests', 'special_requests'
        ]

    def validate(self, attrs):
        experience = attrs['experience']
        num_guests = attrs['num_guests']
        if num_guests > experience.available_spots:
            raise serializers.ValidationError(
                f"Only {experience.available_spots} spots available."
            )
        if not experience.is_active:
            raise serializers.ValidationError("This experience is no longer available.")
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    experience = ExperienceListSerializer(read_only=True)
    tourist = UserPublicSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'tourist', 'experience', 'booking_date', 'booking_time',
            'num_guests', 'special_requests', 'status', 'status_display',
            'total_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tourist', 'total_price', 'created_at', 'updated_at']


class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']
