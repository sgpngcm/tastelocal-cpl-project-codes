"""Serializers for itineraries."""
from rest_framework import serializers
from .models import Itinerary, ItineraryItem
from experiences.serializers import ExperienceListSerializer


class ItineraryItemSerializer(serializers.ModelSerializer):
    experience = ExperienceListSerializer(read_only=True)
    experience_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ItineraryItem
        fields = ['id', 'experience', 'experience_id', 'day_number', 'order', 'notes', 'planned_time']


class ItinerarySerializer(serializers.ModelSerializer):
    items = ItineraryItemSerializer(many=True, read_only=True)
    tourist_name = serializers.CharField(source='tourist.display_name', read_only=True)

    class Meta:
        model = Itinerary
        fields = [
            'id', 'tourist_name', 'title', 'description', 'start_date',
            'end_date', 'share_uuid', 'is_public', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'share_uuid', 'created_at', 'updated_at']


class ItineraryCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = Itinerary
        fields = ['title', 'description', 'start_date', 'end_date', 'is_public', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        itinerary = Itinerary.objects.create(**validated_data)
        for item_data in items_data:
            ItineraryItem.objects.create(
                itinerary=itinerary,
                experience_id=item_data.get('experience_id'),
                day_number=item_data.get('day_number', 1),
                order=item_data.get('order', 0),
                notes=item_data.get('notes', ''),
                planned_time=item_data.get('planned_time'),
            )
        return itinerary

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                ItineraryItem.objects.create(
                    itinerary=instance,
                    experience_id=item_data.get('experience_id'),
                    day_number=item_data.get('day_number', 1),
                    order=item_data.get('order', 0),
                    notes=item_data.get('notes', ''),
                    planned_time=item_data.get('planned_time'),
                )
        return instance
