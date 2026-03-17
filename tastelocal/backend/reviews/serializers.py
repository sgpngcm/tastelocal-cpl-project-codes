from rest_framework import serializers
from django.utils import timezone
from django.db.models import Q
from .models import Review
from accounts.serializers import UserPublicSerializer


class ReviewSerializer(serializers.ModelSerializer):
    tourist = UserPublicSerializer(read_only=True)
    experience_title = serializers.CharField(source='experience.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'tourist', 'experience', 'experience_title',
            'rating', 'title', 'comment', 'is_approved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tourist', 'is_approved', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['experience', 'rating', 'title', 'comment']

    def validate(self, attrs):
        user = self.context['request'].user
        experience = attrs['experience']
        from bookings.models import Booking

        today = timezone.localdate()

        eligible_booking = Booking.objects.filter(
            tourist=user,
            experience=experience
        ).exclude(
            status='cancelled'
        ).filter(
            Q(status='completed') | Q(booking_date__lt=today)
        ).exists()

        if not eligible_booking:
            raise serializers.ValidationError(
                "You can only review experiences you have completed or already attended."
            )

        if Review.objects.filter(tourist=user, experience=experience).exists():
            raise serializers.ValidationError(
                "You have already reviewed this experience."
            )

        return attrs