"""Views for itineraries."""
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Itinerary, ItineraryItem
from .serializers import ItinerarySerializer, ItineraryCreateSerializer, ItineraryItemSerializer


class ItineraryListCreateView(generics.ListCreateAPIView):
    """List and create itineraries for current user."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ItineraryCreateSerializer
        return ItinerarySerializer

    def get_queryset(self):
        return Itinerary.objects.filter(
            tourist=self.request.user
        ).prefetch_related('items__experience')

    def perform_create(self, serializer):
        itinerary = serializer.save(tourist=self.request.user)
        # Send email notification
        from accounts.signals import send_itinerary_email
        send_itinerary_email(itinerary)


class ItineraryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete an itinerary."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ItineraryCreateSerializer
        return ItinerarySerializer

    def get_queryset(self):
        return Itinerary.objects.filter(
            tourist=self.request.user
        ).prefetch_related('items__experience')


class SharedItineraryView(generics.RetrieveAPIView):
    """View a shared itinerary by UUID."""
    serializer_class = ItinerarySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'share_uuid'

    def get_queryset(self):
        return Itinerary.objects.filter(
            is_public=True
        ).prefetch_related('items__experience')


class ItineraryAddItemView(generics.CreateAPIView):
    """Add an item to an itinerary."""
    serializer_class = ItineraryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        itinerary = Itinerary.objects.get(
            pk=self.kwargs['itinerary_id'],
            tourist=self.request.user
        )
        serializer.save(itinerary=itinerary)


class ItineraryRemoveItemView(generics.DestroyAPIView):
    """Remove an item from an itinerary."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ItineraryItem.objects.filter(
            itinerary__tourist=self.request.user
        )
