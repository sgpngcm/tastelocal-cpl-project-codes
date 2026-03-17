"""Views for reviews."""
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer


class ReviewListView(generics.ListAPIView):
    """List approved reviews for an experience."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        experience_id = self.kwargs.get('experience_id')
        return Review.objects.filter(
            experience_id=experience_id, is_approved=True
        ).select_related('tourist')


class ReviewCreateView(generics.CreateAPIView):
    """Create a review (authenticated tourists with completed booking)."""
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(tourist=self.request.user)


class MyReviewsView(generics.ListAPIView):
    """List current user's reviews."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            tourist=self.request.user
        ).select_related('experience')


class ReviewUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """Update or delete own review."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(tourist=self.request.user)


# Admin
class AdminReviewListView(generics.ListAPIView):
    """Admin: list all reviews."""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Review.objects.all().select_related('tourist', 'experience')
    filterset_fields = ['is_approved', 'rating']


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_moderate_review(request, pk):
    """Admin: approve or reject review."""
    try:
        review = Review.objects.get(pk=pk)
        review.is_approved = request.data.get('approved', True)
        review.save()
        return Response({
            'message': f'Review {"approved" if review.is_approved else "rejected"}.',
            'review': ReviewSerializer(review).data
        })
    except Review.DoesNotExist:
        return Response({'error': 'Review not found.'}, status=404)
