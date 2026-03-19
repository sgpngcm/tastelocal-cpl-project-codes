from rest_framework import status
from rest_framework.test import APITestCase

from reviews.models import Review
from tests.factories import create_booking, create_experience, create_user


class ReviewApiTests(APITestCase):
    def test_review_requires_completed_booking(self):
        tourist = create_user(role='tourist', username='tourist-review-blocked')
        experience = create_experience()
        create_booking(tourist=tourist, experience=experience, status='confirmed')
        self.client.force_authenticate(tourist)

        payload = {
            'experience': experience.id,
            'rating': 5,
            'title': 'Excellent',
            'comment': 'Loved the flavors and the guide.',
        }
        response = self.client.post('/api/reviews/create/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('completed', str(response.data))

    def test_completed_booking_allows_one_review_only(self):
        tourist = create_user(role='tourist', username='tourist-reviewer')
        experience = create_experience()
        create_booking(tourist=tourist, experience=experience, status='completed')
        self.client.force_authenticate(tourist)

        payload = {
            'experience': experience.id,
            'rating': 4,
            'title': 'Worth it',
            'comment': 'Great mix of food and stories.',
        }
        first = self.client.post('/api/reviews/create/', payload, format='json')
        second = self.client.post('/api/reviews/create/', payload, format='json')

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.filter(tourist=tourist, experience=experience).count(), 1)
