"""Enrich TasteLocal vendor seed data with official Google Places API data."""
from __future__ import annotations

import json
from urllib import error, request

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q

from vendors.models import VendorProfile

TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
SINGAPORE_BIAS = {
    'circle': {
        'center': {'latitude': 1.3521, 'longitude': 103.8198},
        'radius': 35000,
    }
}
FIELD_MASK = ','.join([
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.websiteUri',
    'places.regularOpeningHours',
    'places.rating',
    'places.userRatingCount',
    'places.id',
])


class Command(BaseCommand):
    help = 'Match seeded vendors against the official Google Places API and update address, lat/lng, website, and opening hours.'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=0, help='Maximum number of vendors to process.')
        parser.add_argument('--only-missing', action='store_true', help='Only enrich vendors missing coordinates, website, or opening hours.')
        parser.add_argument('--dry-run', action='store_true', help='Show proposed changes without saving.')

    def handle(self, *args, **options):
        api_key = settings.GOOGLE_MAPS_API_KEY
        if not api_key:
            raise CommandError('GOOGLE_MAPS_API_KEY is not configured. Add it to your .env before running this command.')

        queryset = VendorProfile.objects.all().order_by('id')
        if options['only_missing']:
            queryset = queryset.filter(Q(latitude__isnull=True) | Q(longitude__isnull=True) | Q(website='') | Q(opening_hours=''))
        vendors = list(queryset)
        if options['limit']:
            vendors = vendors[:options['limit']]

        self.stdout.write(f'Processing {len(vendors)} vendors against Google Places...')
        updated = 0
        for vendor in vendors:
            place = self.lookup_vendor(vendor, api_key)
            if not place:
                self.stdout.write(self.style.WARNING(f'  No match for {vendor.business_name}'))
                continue

            changes = {}
            if place.get('formattedAddress'):
                changes['address'] = place['formattedAddress']
            location = place.get('location') or {}
            if location.get('latitude') is not None and location.get('longitude') is not None:
                changes['latitude'] = location['latitude']
                changes['longitude'] = location['longitude']
            if place.get('websiteUri'):
                changes['website'] = place['websiteUri']
            weekday_descriptions = (place.get('regularOpeningHours') or {}).get('weekdayDescriptions') or []
            if weekday_descriptions:
                changes['opening_hours'] = ' | '.join(weekday_descriptions)

            if not changes:
                self.stdout.write(f'  No useful fields returned for {vendor.business_name}')
                continue

            preview = ', '.join(f'{key}={value}' for key, value in changes.items())
            if options['dry_run']:
                self.stdout.write(f'  [dry-run] {vendor.business_name}: {preview}')
                continue

            for field, value in changes.items():
                setattr(vendor, field, value)
            vendor.save(update_fields=list(changes.keys()) + ['updated_at'])
            updated += 1
            self.stdout.write(self.style.SUCCESS(f'  Updated {vendor.business_name}: {preview}'))

        self.stdout.write(self.style.SUCCESS(f'Finished. Updated {updated} vendors.'))

    def lookup_vendor(self, vendor: VendorProfile, api_key: str):
        payload = json.dumps({
            'textQuery': f'{vendor.business_name}, {vendor.address}, Singapore',
            'locationBias': SINGAPORE_BIAS,
            'languageCode': 'en',
            'regionCode': 'SG',
            'pageSize': 1,
        }).encode('utf-8')

        req = request.Request(
            TEXT_SEARCH_URL,
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': api_key,
                'X-Goog-FieldMask': FIELD_MASK,
            },
            method='POST',
        )

        try:
            with request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode('utf-8'))
        except error.HTTPError as exc:
            body = exc.read().decode('utf-8', errors='ignore')
            self.stdout.write(self.style.ERROR(f'  Google Places error for {vendor.business_name}: {exc.code} {body[:180]}'))
            return None
        except Exception as exc:  # pragma: no cover - defensive command handling
            self.stdout.write(self.style.ERROR(f'  Request failed for {vendor.business_name}: {exc}'))
            return None

        places = data.get('places') or []
        return places[0] if places else None
