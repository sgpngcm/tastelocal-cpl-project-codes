from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from experiences.models import Tag
from tests.factories import create_experience, create_user, create_vendor_profile


class ExperienceApiTests(APITestCase):
    def test_public_list_hides_unapproved_vendor_experiences(self):
        approved_vendor = create_vendor_profile(approved=True, business_name='Visible Vendor')
        hidden_vendor = create_vendor_profile(approved=False, business_name='Hidden Vendor')
        create_experience(vendor=approved_vendor, title='Visible Experience')
        create_experience(vendor=hidden_vendor, title='Hidden Experience')

        response = self.client.get('/api/experiences/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['results']]
        self.assertIn('Visible Experience', titles)
        self.assertNotIn('Hidden Experience', titles)

    def test_vendor_can_create_experience_and_tags(self):
        vendor_user = create_user(role='vendor', username='vendor-exp')
        create_vendor_profile(user=vendor_user, approved=True)
        self.client.force_authenticate(vendor_user)

        payload = {
            'title': 'Little India Spice Walk',
            'description': 'Explore aromatic dishes across Little India.',
            'category': 'food_tour',
            'price': '95.00',
            'currency': 'SGD',
            'capacity': 12,
            'duration_hours': '2.5',
            'available_from': str(date.today()),
            'available_to': str(date.today() + timedelta(days=20)),
            'start_time': '10:00:00',
            'meeting_point': 'Little India MRT',
            'what_included': 'Tastings',
            'what_to_bring': 'Umbrella',
            'is_active': True,
            'tag_names': ['Indian Food', 'Spice Trail'],
        }

        response = self.client.post('/api/experiences/create/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Tag.objects.filter(slug='indian-food').exists())
        self.assertTrue(Tag.objects.filter(slug='spice-trail').exists())
