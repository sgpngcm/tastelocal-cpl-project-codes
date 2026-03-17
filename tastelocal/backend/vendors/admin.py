"""Admin for vendors."""
from django.contrib import admin
from .models import VendorProfile, VendorPhoto


class VendorPhotoInline(admin.TabularInline):
    model = VendorPhoto
    extra = 1


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'cuisine_type', 'is_approved', 'is_featured', 'created_at']
    list_filter = ['is_approved', 'is_featured', 'cuisine_type']
    search_fields = ['business_name', 'user__username', 'address']
    list_editable = ['is_approved', 'is_featured']
    inlines = [VendorPhotoInline]
