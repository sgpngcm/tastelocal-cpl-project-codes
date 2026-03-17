from django.contrib import admin
from .models import FoodExperience, ExperienceImage, Tag


class ExperienceImageInline(admin.TabularInline):
    model = ExperienceImage
    extra = 1


@admin.register(FoodExperience)
class FoodExperienceAdmin(admin.ModelAdmin):
    list_display = ['title', 'vendor', 'category', 'price', 'is_active', 'is_featured', 'created_at']
    list_filter = ['is_active', 'is_featured', 'category']
    search_fields = ['title', 'vendor__business_name']
    list_editable = ['is_active', 'is_featured']
    inlines = [ExperienceImageInline]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
