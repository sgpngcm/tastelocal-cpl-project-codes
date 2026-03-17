"""Views for bookings."""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingCreateSerializer, BookingSerializer, BookingStatusSerializer


class BookingCreateView(generics.CreateAPIView):
    """Create a new booking (tourist only)."""
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = serializer.save(tourist=self.request.user)
        # Send confirmation email
        from accounts.signals import send_booking_confirmation_email
        send_booking_confirmation_email(booking)

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['tourist', 'admin']:
            return Response(
                {'error': 'Only tourist accounts can make bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class TouristBookingListView(generics.ListAPIView):
    """List bookings for current tourist."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Booking.objects.filter(
            tourist=self.request.user
        ).select_related('experience__vendor')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class BookingDetailView(generics.RetrieveAPIView):
    """Get booking details."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'admin':
            return Booking.objects.all()
        return Booking.objects.filter(tourist=user)


class BookingCancelView(generics.UpdateAPIView):
    """Cancel a booking."""
    serializer_class = BookingStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(tourist=self.request.user)

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel a {booking.status} booking.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save()
        return Response(BookingSerializer(booking).data)


class VendorBookingListView(generics.ListAPIView):
    """List bookings for vendor's experiences."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            experience__vendor__user=self.request.user
        ).select_related('experience__vendor', 'tourist')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def vendor_update_booking_status(request, pk):
    """Vendor updates booking status."""
    try:
        booking = Booking.objects.get(
            pk=pk, experience__vendor__user=request.user
        )
        new_status = request.data.get('status')
        if new_status not in ['confirmed', 'completed', 'cancelled']:
            return Response({'error': 'Invalid status.'}, status=400)
        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking).data)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found.'}, status=404)


# Admin views
class AdminBookingListView(generics.ListAPIView):
    """Admin: list all bookings."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Booking.objects.all().select_related('experience__vendor', 'tourist')
    filterset_fields = ['status']
