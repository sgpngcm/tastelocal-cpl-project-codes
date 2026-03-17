"""URL patterns for reviews."""
from django.urls import path
from . import views

urlpatterns = [
    path('experience/<int:experience_id>/', views.ReviewListView.as_view(), name='experience_reviews'),
    path('create/', views.ReviewCreateView.as_view(), name='review_create'),
    path('my-reviews/', views.MyReviewsView.as_view(), name='my_reviews'),
    path('<int:pk>/', views.ReviewUpdateView.as_view(), name='review_detail'),
    path('admin/all/', views.AdminReviewListView.as_view(), name='admin_reviews'),
    path('admin/<int:pk>/moderate/', views.admin_moderate_review, name='admin_moderate_review'),
]
