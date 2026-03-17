"""URL patterns for blog."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.BlogPostListView.as_view(), name='blog_list'),
    path('categories/', views.BlogCategoryListView.as_view(), name='blog_categories'),
    path('<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog_detail'),
]
