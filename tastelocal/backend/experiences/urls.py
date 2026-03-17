"""URL patterns for experiences."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.ExperienceListView.as_view(), name='experience_list'),
    path('featured/', views.featured_experiences, name='featured_experiences'),
    path('categories/', views.experience_categories, name='experience_categories'),
    path('tags/', views.tag_list, name='tag_list'),
    path('create/', views.ExperienceCreateView.as_view(), name='experience_create'),
    path('my-listings/', views.VendorExperienceListView.as_view(), name='vendor_experiences'),
    path('<int:pk>/', views.ExperienceDetailView.as_view(), name='experience_detail'),
    path('<int:pk>/edit/', views.ExperienceUpdateView.as_view(), name='experience_update'),
    path('<int:experience_id>/images/', views.ExperienceImageUploadView.as_view(), name='experience_image_upload'),
]
