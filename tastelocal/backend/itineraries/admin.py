from django.contrib import admin
from .models import Itinerary, ItineraryItem


class ItineraryItemInline(admin.TabularInline):
    model = ItineraryItem
    extra = 1


@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ['title', 'tourist', 'start_date', 'end_date', 'is_public', 'created_at']
    list_filter = ['is_public']
    search_fields = ['title', 'tourist__username']
    inlines = [ItineraryItemInline]
