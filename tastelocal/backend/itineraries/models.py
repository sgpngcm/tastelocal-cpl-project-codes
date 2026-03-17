"""Itinerary models."""
import uuid
from django.db import models
from django.conf import settings
from experiences.models import FoodExperience


class Itinerary(models.Model):
    """Tourist food itinerary."""
    tourist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='itineraries'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    share_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'itineraries'
        ordering = ['-created_at']
        verbose_name_plural = 'Itineraries'

    def __str__(self):
        return f"{self.title} by {self.tourist.username}"


class ItineraryItem(models.Model):
    """Item in an itinerary."""
    itinerary = models.ForeignKey(
        Itinerary,
        on_delete=models.CASCADE,
        related_name='items'
    )
    experience = models.ForeignKey(
        FoodExperience,
        on_delete=models.CASCADE,
        related_name='itinerary_items'
    )
    day_number = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    planned_time = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'itinerary_items'
        ordering = ['day_number', 'order']

    def __str__(self):
        return f"Day {self.day_number}: {self.experience.title}"
