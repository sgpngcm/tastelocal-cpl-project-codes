"""Serializers for food experiences."""
from rest_framework import serializers
from .models import FoodExperience, ExperienceImage, Tag
from vendors.serializers import VendorListSerializer


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class ExperienceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceImage
        fields = ['id', 'image', 'caption', 'order']


class ExperienceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing experiences."""
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = FoodExperience
        fields = [
            'id', 'title', 'category', 'category_display', 'price',
            'currency', 'duration_hours', 'image', 'vendor_name',
            'vendor_id', 'avg_rating', 'total_reviews', 'is_featured',
            'available_from', 'available_to', 'tags', 'capacity'
        ]


class ExperienceDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for a single experience."""
    vendor = VendorListSerializer(read_only=True)
    images = ExperienceImageSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = FoodExperience
        fields = [
            'id', 'vendor', 'title', 'description', 'category',
            'category_display', 'price', 'currency', 'capacity',
            'duration_hours', 'available_from', 'available_to',
            'start_time', 'meeting_point', 'what_included',
            'what_to_bring', 'image', 'images', 'tags', 'is_active',
            'is_featured', 'avg_rating', 'total_reviews',
            'available_spots', 'created_at'
        ]


class ExperienceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating experiences."""
    tag_names = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = FoodExperience
        fields = [
            'title', 'description', 'category', 'price', 'currency',
            'capacity', 'duration_hours', 'available_from', 'available_to',
            'start_time', 'meeting_point', 'what_included', 'what_to_bring',
            'image', 'is_active', 'tag_names'
        ]

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        experience = FoodExperience.objects.create(**validated_data)
        self._set_tags(experience, tag_names)
        return experience

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            self._set_tags(instance, tag_names)
        return instance

    def _set_tags(self, experience, tag_names):
        from django.utils.text import slugify
        tags = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name}
            )
            tags.append(tag)
        experience.tags.set(tags)
