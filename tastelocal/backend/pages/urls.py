"""URL patterns for pages."""
from django.urls import path
from . import views

urlpatterns = [
    path('contact/', views.ContactSubmitView.as_view(), name='contact_submit'),
    path('admin/contacts/', views.AdminContactListView.as_view(), name='admin_contacts'),
    path('<slug:slug>/', views.PageDetailView.as_view(), name='page_detail'),
]
