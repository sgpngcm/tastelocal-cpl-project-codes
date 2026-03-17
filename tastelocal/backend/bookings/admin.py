from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'tourist', 'experience', 'booking_date', 'num_guests', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'booking_date']
    search_fields = ['tourist__username', 'experience__title']
    list_editable = ['status']
