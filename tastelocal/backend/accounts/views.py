"""Views for user accounts."""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer,
    PasswordChangeSerializer, AdminUserSerializer
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that includes user info."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserProfileSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view returning user data with tokens."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Send welcome email
        from accounts.signals import send_welcome_email
        send_welcome_email(user)
        return Response({
            'message': 'Registration successful! A welcome email has been sent.',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user


class PasswordChangeView(generics.UpdateAPIView):
    """Change password for authenticated user."""
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'})


class AdminUserListView(generics.ListAPIView):
    """Admin: list all users."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username']


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: manage individual user."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    """Admin dashboard statistics."""
    from bookings.models import Booking
    from reviews.models import Review
    from experiences.models import FoodExperience
    from vendors.models import VendorProfile
    from django.db.models import Count, Avg
    from django.utils import timezone
    from datetime import timedelta

    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    stats = {
        'total_users': User.objects.count(),
        'total_tourists': User.objects.filter(role='tourist').count(),
        'total_vendors': User.objects.filter(role='vendor').count(),
        'total_experiences': FoodExperience.objects.filter(is_active=True).count(),
        'total_bookings': Booking.objects.count(),
        'total_reviews': Review.objects.filter(is_approved=True).count(),
        'pending_vendors': VendorProfile.objects.filter(is_approved=False).count(),
        'pending_reviews': Review.objects.filter(is_approved=False).count(),
        'recent_bookings': Booking.objects.filter(created_at__gte=thirty_days_ago).count(),
        'avg_rating': Review.objects.filter(is_approved=True).aggregate(
            avg=Avg('rating'))['avg'] or 0,
        'bookings_by_status': list(
            Booking.objects.values('status').annotate(count=Count('id'))
        ),
        'monthly_bookings': list(
            Booking.objects.filter(created_at__gte=thirty_days_ago)
            .extra(select={'day': "DATE(created_at)"})
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        ),
        'popular_cuisines': list(
            VendorProfile.objects.filter(is_approved=True)
            .values('cuisine_type')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        ),
    }
    return Response(stats)
