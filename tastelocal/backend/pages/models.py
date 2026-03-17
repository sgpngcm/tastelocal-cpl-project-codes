"""Static pages model."""
from django.db import models


class Page(models.Model):
    """Static page content (About, Privacy, Terms, etc.)."""
    SLUG_CHOICES = [
        ('about', 'About Us'),
        ('privacy', 'Privacy Policy'),
        ('terms', 'Terms of Service'),
        ('contact', 'Contact Us'),
        ('sitemap', 'Site Map'),
        ('faq', 'FAQ'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    meta_description = models.CharField(max_length=300, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pages'
        ordering = ['title']

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    """Contact form submissions."""
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} from {self.name}"
