"""Review and rating models."""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from experiences.models import FoodExperience


class Review(models.Model):
    """Tourist review for a food experience."""
    tourist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    experience = models.ForeignKey(
        FoodExperience,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ['tourist', 'experience']
        indexes = [
            models.Index(fields=['experience']),
        ]

    def __str__(self):
        return f"Review by {self.tourist.username} - {self.experience.title} ({self.rating}/5)"
