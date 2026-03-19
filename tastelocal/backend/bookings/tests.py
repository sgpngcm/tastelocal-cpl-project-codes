from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from bookings.models import Booking
from tests.factories import create_booking, create_experience, create_user, create_vendor_profile


class BookingApiTests(APITestCase):
    def test_tourist_can_create_booking_and_total_price_is_calculated(self):
        tourist = create_user(role='tourist', username='tourist-booker')
        experience = create_experience(price=Decimal('45.50'))
        self.client.force_authenticate(tourist)

        payload = {
            'experience': experience.id,
            'booking_date': '2030-01-20',
            'booking_time': '18:30:00',
            'num_guests': 3,
            'special_requests': 'Need a high chair',
        }

        response = self.client.post('/api/bookings/create/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.get(id=response.data['id'])
        self.assertEqual(booking.total_price, Decimal('136.50'))

    def test_vendor_cannot_create_booking(self):
        vendor_user = create_user(role='vendor', username='vendor-cannot-book')
        create_vendor_profile(user=vendor_user, approved=True)
        experience = create_experience()
        self.client.force_authenticate(vendor_user)

        payload = {
            'experience': experience.id,
            'booking_date': '2030-01-20',
            'num_guests': 1,
        }
        response = self.client.post('/api/bookings/create/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Only tourist accounts can make bookings.')

    def test_completed_booking_cannot_be_cancelled(self):
        tourist = create_user(role='tourist', username='tourist-cancel')
        booking = create_booking(tourist=tourist, status='completed')
        self.client.force_authenticate(tourist)

        response = self.client.put(f'/api/bookings/{booking.id}/cancel/', {'status': 'cancelled'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Cannot cancel a completed booking.')
