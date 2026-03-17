"""Admin configuration for accounts."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    fieldsets = UserAdmin.fieldsets + (
        ('TasteLocal Profile', {
            'fields': ('role', 'phone', 'profile_image', 'bio', 'date_of_birth', 'country', 'city', 'email_verified')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('TasteLocal Profile', {
            'fields': ('email', 'role', 'first_name', 'last_name')
        }),
    )
