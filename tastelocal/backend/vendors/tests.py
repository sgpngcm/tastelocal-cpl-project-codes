from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from tests.factories import create_user, create_vendor_profile


class VendorProfileApiTests(APITestCase):
    def test_vendor_can_create_profile(self):
        vendor_user = create_user(role='vendor', username='vendor-create')
        self.client.force_authenticate(vendor_user)

        payload = {
            'business_name': 'Spice Garden',
            'description': 'Family-run local cuisine.',
            'cuisine_type': 'local',
            'address': '99 Orchard Road, Singapore',
            'latitude': '1.3010000',
            'longitude': '103.8390000',
            'phone': '61234567',
            'website': 'https://spice-garden.example.com',
            'email': 'hello@spice-garden.example.com',
            'opening_hours': 'Mon-Sun 9am-9pm',
        }

        response = self.client.post('/api/vendors/create/', payload, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['business_name'], 'Spice Garden')

    def test_public_vendor_list_returns_only_approved_profiles(self):
        create_vendor_profile(approved=True, business_name='Approved Vendor')
        create_vendor_profile(approved=False, business_name='Hidden Vendor')

        response = self.client.get('/api/vendors/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item['business_name'] for item in response.data['results']]
        self.assertIn('Approved Vendor', names)
        self.assertNotIn('Hidden Vendor', names)

    def test_map_endpoint_returns_only_approved_profiles_with_coordinates(self):
        create_vendor_profile(
            approved=True,
            business_name='Mapped Vendor',
            latitude=Decimal('1.3200000'),
            longitude=Decimal('103.8200000'),
        )
        create_vendor_profile(
            approved=True,
            business_name='No Coordinate Vendor',
            latitude=None,
            longitude=None,
        )
        create_vendor_profile(approved=False, business_name='Not Approved Vendor')

        response = self.client.get('/api/vendors/map/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_names = [item['business_name'] for item in response.data]
        self.assertEqual(returned_names, ['Mapped Vendor'])

    def test_my_profile_get_returns_full_profile_payload(self):
        vendor_user = create_user(role='vendor', username='vendor-own-profile')
        profile = create_vendor_profile(user=vendor_user, approved=False, business_name='Own Profile Vendor')
        self.client.force_authenticate(vendor_user)

        response = self.client.get('/api/vendors/my-profile/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], profile.id)
        self.assertEqual(response.data['business_name'], 'Own Profile Vendor')
