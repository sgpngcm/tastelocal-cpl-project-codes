"""Configuration API endpoints."""
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny])
def get_config(request):
    """Return public configuration values."""
    return Response({
        'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY,
    })


urlpatterns = [
    path('', get_config, name='config'),
]
