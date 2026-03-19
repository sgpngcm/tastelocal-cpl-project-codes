from rest_framework import status
from rest_framework.test import APITestCase

from blog.models import BlogPost
from tests.factories import create_blog_post


class BlogApiTests(APITestCase):
    def test_list_returns_only_published_posts(self):
        create_blog_post(title='Published Guide', slug='published-guide', published=True)
        create_blog_post(title='Draft Guide', slug='draft-guide', published=False)

        response = self.client.get('/api/blog/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item['title'] for item in response.data['results']]
        self.assertIn('Published Guide', titles)
        self.assertNotIn('Draft Guide', titles)

    def test_detail_increments_view_count(self):
        post = create_blog_post(title='Popular Guide', slug='popular-guide', published=True)

        response = self.client.get('/api/blog/popular-guide/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        post.refresh_from_db()
        self.assertEqual(post.views_count, 1)
