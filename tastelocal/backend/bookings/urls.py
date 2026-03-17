"""URL patterns for bookings."""
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.BookingCreateView.as_view(), name='booking_create'),
    path('my-bookings/', views.TouristBookingListView.as_view(), name='tourist_bookings'),
    path('vendor-bookings/', views.VendorBookingListView.as_view(), name='vendor_bookings'),
    path('<int:pk>/', views.BookingDetailView.as_view(), name='booking_detail'),
    path('<int:pk>/cancel/', views.BookingCancelView.as_view(), name='booking_cancel'),
    path('<int:pk>/update-status/', views.vendor_update_booking_status, name='vendor_update_booking'),
    path('admin/all/', views.AdminBookingListView.as_view(), name='admin_bookings'),
]
