"""Views for vendor profiles."""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import VendorProfile, VendorPhoto
from .serializers import (
    VendorProfileSerializer, VendorProfileCreateSerializer,
    VendorListSerializer, VendorMapSerializer, VendorPhotoSerializer
)


class IsVendorOwner(permissions.BasePermission):
    """Only allow vendor owners to edit their profile."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class VendorListView(generics.ListAPIView):
    """Public list of approved vendors."""
    serializer_class = VendorListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cuisine_type', 'is_featured']

    def get_queryset(self):
        queryset = VendorProfile.objects.filter(is_approved=True)
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                models.Q(business_name__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(address__icontains=search)
            )
        return queryset


class VendorDetailView(generics.RetrieveAPIView):
    """Public vendor profile detail."""
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.AllowAny]
    queryset = VendorProfile.objects.filter(is_approved=True)


class VendorCreateView(generics.CreateAPIView):
    """Create vendor profile (vendor users only)."""
    serializer_class = VendorProfileCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.role != 'vendor':
            return Response(
                {'error': 'Only vendor accounts can create vendor profiles.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if hasattr(request.user, 'vendor_profile'):
            return Response(
                {'error': 'You already have a vendor profile.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)


class VendorUpdateView(generics.RetrieveUpdateAPIView):
    """Update vendor profile (owner only)."""
    serializer_class = VendorProfileCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendorOwner]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user.vendor_profile


class VendorPhotoUploadView(generics.CreateAPIView):
    """Upload photo to vendor profile."""
    serializer_class = VendorPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        vendor = self.request.user.vendor_profile
        serializer.save(vendor=vendor)


class VendorPhotoDeleteView(generics.DestroyAPIView):
    """Delete vendor photo."""
    serializer_class = VendorPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VendorPhoto.objects.filter(vendor__user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def vendor_map_data(request):
    """Return vendor locations for map display."""
    vendors = VendorProfile.objects.filter(
        is_approved=True,
        latitude__isnull=False,
        longitude__isnull=False
    )
    serializer = VendorMapSerializer(vendors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def cuisine_types(request):
    """Return available cuisine types."""
    return Response(VendorProfile.CUISINE_CHOICES)


# Admin vendor management
class AdminVendorListView(generics.ListAPIView):
    """Admin: list all vendors including unapproved."""
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = VendorProfile.objects.all()
    filterset_fields = ['is_approved', 'cuisine_type']


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_approve_vendor(request, pk):
    """Admin: approve or reject vendor."""
    try:
        vendor = VendorProfile.objects.get(pk=pk)
        vendor.is_approved = request.data.get('approved', True)
        vendor.save()
        return Response({
            'message': f'Vendor {"approved" if vendor.is_approved else "rejected"} successfully.',
            'vendor': VendorProfileSerializer(vendor).data
        })
    except VendorProfile.DoesNotExist:
        return Response({'error': 'Vendor not found.'}, status=404)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_feature_vendor(request, pk):
    """Admin: toggle featured status."""
    try:
        vendor = VendorProfile.objects.get(pk=pk)
        vendor.is_featured = not vendor.is_featured
        vendor.save()
        return Response({
            'message': f'Vendor {"featured" if vendor.is_featured else "unfeatured"} successfully.',
            'is_featured': vendor.is_featured
        })
    except VendorProfile.DoesNotExist:
        return Response({'error': 'Vendor not found.'}, status=404)
