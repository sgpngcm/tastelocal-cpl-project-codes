"""Vendor profile models."""
from django.db import models
from django.conf import settings


class VendorProfile(models.Model):
    """Vendor business profile linked to a user account."""

    CUISINE_CHOICES = [
        ('local', 'Local Cuisine'),
        ('chinese', 'Chinese'),
        ('malay', 'Malay'),
        ('indian', 'Indian'),
        ('peranakan', 'Peranakan'),
        ('seafood', 'Seafood'),
        ('street_food', 'Street Food'),
        ('hawker', 'Hawker'),
        ('fine_dining', 'Fine Dining'),
        ('cafe', 'Café & Coffee'),
        ('bakery', 'Bakery & Desserts'),
        ('vegetarian', 'Vegetarian/Vegan'),
        ('fusion', 'Fusion'),
        ('thai', 'Thai'),
        ('japanese', 'Japanese'),
        ('korean', 'Korean'),
        ('western', 'Western'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_profile'
    )
    business_name = models.CharField(max_length=200)
    description = models.TextField()
    cuisine_type = models.CharField(max_length=50, choices=CUISINE_CHOICES)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    opening_hours = models.TextField(blank=True, help_text="e.g., Mon-Fri: 9am-9pm")
    cover_image = models.ImageField(upload_to='vendors/covers/', blank=True, null=True)
    logo = models.ImageField(upload_to='vendors/logos/', blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendor_profiles'
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return self.business_name

    @property
    def avg_rating(self):
        from reviews.models import Review
        result = Review.objects.filter(
            experience__vendor=self, is_approved=True
        ).aggregate(models.Avg('rating'))
        return round(result['rating__avg'] or 0, 1)

    @property
    def total_reviews(self):
        from reviews.models import Review
        return Review.objects.filter(
            experience__vendor=self, is_approved=True
        ).count()


class VendorPhoto(models.Model):
    """Additional photos for vendor profile."""
    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='vendors/photos/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vendor_photos'
        ordering = ['-is_primary', '-uploaded_at']

    def __str__(self):
        return f"Photo for {self.vendor.business_name}"
