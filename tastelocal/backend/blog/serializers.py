"""Serializers for blog."""
from rest_framework import serializers
from .models import BlogPost, BlogCategory
from accounts.serializers import UserPublicSerializer


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description']


class BlogPostListSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)
    category = BlogCategorySerializer(read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'author', 'category', 'title', 'slug', 'excerpt',
            'cover_image', 'is_featured', 'views_count', 'created_at'
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)
    category = BlogCategorySerializer(read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'author', 'category', 'title', 'slug', 'excerpt',
            'content', 'cover_image', 'is_featured', 'views_count',
            'created_at', 'updated_at'
        ]
