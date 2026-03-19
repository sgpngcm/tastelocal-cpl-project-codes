from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthApiTests(APITestCase):
    def test_registration_downgrades_admin_role_to_tourist(self):
        payload = {
            'username': 'newtraveler',
            'email': 'newtraveler@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'role': 'admin',
            'first_name': 'New',
            'last_name': 'Traveler',
            'phone': '99998888',
            'country': 'Singapore',
            'city': 'Singapore',
        }

        response = self.client.post('/api/auth/register/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'tourist')
        self.assertTrue(User.objects.filter(username='newtraveler', role='tourist').exists())

    def test_login_returns_tokens_and_user_payload(self):
        user = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='StrongPass123!',
            role='tourist',
        )

        response = self.client.post(
            '/api/auth/login/',
            {'username': 'alice', 'password': 'StrongPass123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['id'], user.id)
        self.assertEqual(response.data['user']['username'], 'alice')
