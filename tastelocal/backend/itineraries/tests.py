from rest_framework import status
from rest_framework.test import APITestCase

from itineraries.models import ItineraryItem
from tests.factories import create_experience, create_itinerary, create_itinerary_item, create_user


class ItineraryApiTests(APITestCase):
    def test_create_itinerary_with_items(self):
        tourist = create_user(role='tourist', username='itin-owner')
        exp1 = create_experience(title='Breakfast Trail')
        exp2 = create_experience(title='Evening Hawker Tour')
        self.client.force_authenticate(tourist)

        payload = {
            'title': 'Weekend Plan',
            'description': 'Two great stops',
            'start_date': '2030-02-01',
            'end_date': '2030-02-02',
            'is_public': True,
            'items': [
                {'experience_id': exp1.id, 'day_number': 1, 'order': 1, 'notes': 'Start early'},
                {'experience_id': exp2.id, 'day_number': 1, 'order': 2, 'notes': 'Best after sunset'},
            ],
        }

        response = self.client.post('/api/itineraries/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ItineraryItem.objects.count(), 2)

    def test_add_and_remove_item(self):
        tourist = create_user(role='tourist', username='itin-editor')
        itinerary = create_itinerary(tourist=tourist)
        experience = create_experience(title='Tea House Visit')
        self.client.force_authenticate(tourist)

        add_response = self.client.post(
            f'/api/itineraries/{itinerary.id}/items/',
            {'experience_id': experience.id, 'day_number': 2, 'order': 1, 'notes': 'Afternoon stop'},
            format='json',
        )

        self.assertEqual(add_response.status_code, status.HTTP_201_CREATED)
        item_id = add_response.data['id']

        remove_response = self.client.delete(f'/api/itineraries/items/{item_id}/delete/')
        self.assertEqual(remove_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ItineraryItem.objects.filter(id=item_id).exists())

    def test_shared_itinerary_visible_only_when_public(self):
        public_itinerary = create_itinerary(is_public=True)
        private_itinerary = create_itinerary(is_public=False)
        create_itinerary_item(itinerary=public_itinerary)
        create_itinerary_item(itinerary=private_itinerary)

        public_response = self.client.get(f'/api/itineraries/shared/{public_itinerary.share_uuid}/')
        private_response = self.client.get(f'/api/itineraries/shared/{private_itinerary.share_uuid}/')

        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(private_response.status_code, status.HTTP_404_NOT_FOUND)
