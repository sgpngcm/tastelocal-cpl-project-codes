"""Food experience models."""
from django.db import models
from vendors.models import VendorProfile


class Tag(models.Model):
    """Tags for categorizing experiences."""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        db_table = 'tags'
        ordering = ['name']

    def __str__(self):
        return self.name


class FoodExperience(models.Model):
    """Food experience/listing created by vendors."""

    CATEGORY_CHOICES = [
        ('food_tour', 'Food Tour'),
        ('cooking_class', 'Cooking Class'),
        ('tasting_menu', 'Tasting Menu'),
        ('street_food', 'Street Food Walk'),
        ('fine_dining', 'Fine Dining Experience'),
        ('market_tour', 'Market Tour'),
        ('cafe_hopping', 'Café Hopping'),
        ('workshop', 'Food Workshop'),
        ('festival', 'Food Festival'),
        ('other', 'Other'),
    ]

    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='food_tour')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='SGD')
    capacity = models.PositiveIntegerField(default=10)
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=2.0)
    available_from = models.DateField()
    available_to = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    meeting_point = models.TextField(blank=True)
    what_included = models.TextField(blank=True, help_text="What's included in the experience")
    what_to_bring = models.TextField(blank=True)
    image = models.ImageField(upload_to='experiences/', blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='experiences')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'food_experiences'
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['available_from']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.title} - {self.vendor.business_name}"

    @property
    def avg_rating(self):
        result = self.reviews.filter(is_approved=True).aggregate(
            models.Avg('rating'))
        return round(result['rating__avg'] or 0, 1)

    @property
    def total_reviews(self):
        return self.reviews.filter(is_approved=True).count()

    @property
    def available_spots(self):
        from bookings.models import Booking
        booked = Booking.objects.filter(
            experience=self,
            status__in=['confirmed', 'pending']
        ).aggregate(total=models.Sum('num_guests'))
        booked_count = booked['total'] or 0
        return max(0, self.capacity - booked_count)


class ExperienceImage(models.Model):
    """Additional images for experiences."""
    experience = models.ForeignKey(
        FoodExperience,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='experiences/gallery/')
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'experience_images'
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.experience.title}"
