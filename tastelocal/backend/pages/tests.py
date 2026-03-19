from rest_framework import status
from rest_framework.test import APITestCase

from pages.models import ContactMessage


class PagesApiTests(APITestCase):
    def test_contact_form_submission_returns_success_message(self):
        payload = {
            'name': 'Jimmy',
            'email': 'jimmy@example.com',
            'subject': 'Need help planning food tour',
            'message': 'Can you recommend family-friendly experiences?',
        }

        response = self.client.post('/api/pages/contact/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('Thank you for contacting us', response.data['message'])
        self.assertEqual(ContactMessage.objects.count(), 1)
