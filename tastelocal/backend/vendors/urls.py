"""URL patterns for vendors."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.VendorListView.as_view(), name='vendor_list'),
    path('create/', views.VendorCreateView.as_view(), name='vendor_create'),
    path('my-profile/', views.VendorUpdateView.as_view(), name='vendor_my_profile'),
    path('map/', views.vendor_map_data, name='vendor_map'),
    path('cuisines/', views.cuisine_types, name='cuisine_types'),
    path('photos/upload/', views.VendorPhotoUploadView.as_view(), name='vendor_photo_upload'),
    path('photos/<int:pk>/delete/', views.VendorPhotoDeleteView.as_view(), name='vendor_photo_delete'),
    path('<int:pk>/', views.VendorDetailView.as_view(), name='vendor_detail'),
    # Admin
    path('admin/all/', views.AdminVendorListView.as_view(), name='admin_vendors'),
    path('admin/<int:pk>/approve/', views.admin_approve_vendor, name='admin_approve_vendor'),
    path('admin/<int:pk>/feature/', views.admin_feature_vendor, name='admin_feature_vendor'),
]
