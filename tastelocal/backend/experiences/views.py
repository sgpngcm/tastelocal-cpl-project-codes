"""Views for food experiences."""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Avg, Count
from .models import FoodExperience, ExperienceImage, Tag
from .serializers import (
    ExperienceListSerializer, ExperienceDetailSerializer,
    ExperienceCreateSerializer, ExperienceImageSerializer, TagSerializer
)


class ExperienceListView(generics.ListAPIView):
    """Public listing of active experiences with search and filter."""
    serializer_class = ExperienceListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = FoodExperience.objects.filter(
            is_active=True,
            vendor__is_approved=True
        ).select_related('vendor')

        # Search
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(vendor__business_name__icontains=search) |
                Q(tags__name__icontains=search)
            ).distinct()

        # Filters
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        cuisine = self.request.query_params.get('cuisine')
        if cuisine:
            queryset = queryset.filter(vendor__cuisine_type=cuisine)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.annotate(
                avg_r=Avg('reviews__rating')
            ).filter(avg_r__gte=min_rating)

        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        # Sorting
        sort = self.request.query_params.get('sort', '-created_at')
        if sort == 'price_low':
            queryset = queryset.order_by('price')
        elif sort == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort == 'rating':
            queryset = queryset.annotate(
                avg_r=Avg('reviews__rating')
            ).order_by('-avg_r')
        elif sort == 'popular':
            queryset = queryset.annotate(
                review_count=Count('reviews')
            ).order_by('-review_count')
        else:
            queryset = queryset.order_by('-is_featured', '-created_at')

        return queryset


class ExperienceDetailView(generics.RetrieveAPIView):
    """Public detail view of a single experience."""
    serializer_class = ExperienceDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = FoodExperience.objects.filter(
        is_active=True, vendor__is_approved=True
    ).select_related('vendor')


class VendorExperienceListView(generics.ListAPIView):
    """List experiences for the logged-in vendor."""
    serializer_class = ExperienceListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FoodExperience.objects.filter(
            vendor__user=self.request.user
        ).select_related('vendor')


class ExperienceCreateView(generics.CreateAPIView):
    """Create a new experience (vendor only)."""
    serializer_class = ExperienceCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        vendor = self.request.user.vendor_profile
        serializer.save(vendor=vendor)

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'vendor_profile'):
            return Response(
                {'error': 'You must have a vendor profile to create experiences.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class ExperienceUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """Update/delete experience (vendor owner only)."""
    serializer_class = ExperienceCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return FoodExperience.objects.filter(vendor__user=self.request.user)


class ExperienceImageUploadView(generics.CreateAPIView):
    """Upload additional image to experience."""
    serializer_class = ExperienceImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        experience_id = self.kwargs.get('experience_id')
        experience = FoodExperience.objects.get(
            id=experience_id, vendor__user=self.request.user
        )
        serializer.save(experience=experience)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tag_list(request):
    """List all tags."""
    tags = Tag.objects.annotate(
        experience_count=Count('experiences')
    ).filter(experience_count__gt=0)
    return Response(TagSerializer(tags, many=True).data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_experiences(request):
    """Return featured experiences for homepage."""
    experiences = FoodExperience.objects.filter(
        is_active=True, vendor__is_approved=True, is_featured=True
    ).select_related('vendor')[:8]
    serializer = ExperienceListSerializer(experiences, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def experience_categories(request):
    """Return available experience categories."""
    return Response(FoodExperience.CATEGORY_CHOICES)
