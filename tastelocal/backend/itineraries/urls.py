"""URL patterns for itineraries."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.ItineraryListCreateView.as_view(), name='itinerary_list_create'),
    path('<int:pk>/', views.ItineraryDetailView.as_view(), name='itinerary_detail'),
    path('shared/<uuid:share_uuid>/', views.SharedItineraryView.as_view(), name='shared_itinerary'),
    path('<int:itinerary_id>/items/', views.ItineraryAddItemView.as_view(), name='itinerary_add_item'),
    path('items/<int:pk>/delete/', views.ItineraryRemoveItemView.as_view(), name='itinerary_remove_item'),
]
