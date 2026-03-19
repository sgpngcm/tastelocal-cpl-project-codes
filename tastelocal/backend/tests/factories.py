from datetime import date, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model

from blog.models import BlogCategory, BlogPost
from bookings.models import Booking
from experiences.models import FoodExperience
from itineraries.models import Itinerary, ItineraryItem
from pages.models import Page
from vendors.models import VendorProfile

User = get_user_model()


_counter = 0


def _next(prefix='obj'):
    global _counter
    _counter += 1
    return f'{prefix}-{_counter}'


def create_user(role='tourist', password='StrongPass123!', **kwargs):
    username = kwargs.pop('username', _next(role))
    email = kwargs.pop('email', f'{username}@example.com')
    defaults = {
        'first_name': kwargs.pop('first_name', role.capitalize()),
        'last_name': kwargs.pop('last_name', 'User'),
        'phone': kwargs.pop('phone', '12345678'),
        'country': kwargs.pop('country', 'Singapore'),
        'city': kwargs.pop('city', 'Singapore'),
    }
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role,
        **defaults,
        **kwargs,
    )
    return user


def create_vendor_profile(user=None, approved=True, **kwargs):
    user = user or create_user(role='vendor')
    name = kwargs.pop('business_name', f'{user.username} Bistro')
    return VendorProfile.objects.create(
        user=user,
        business_name=name,
        description=kwargs.pop('description', 'Authentic local flavours.'),
        cuisine_type=kwargs.pop('cuisine_type', 'local'),
        address=kwargs.pop('address', '1 Tiong Bahru Road, Singapore'),
        latitude=kwargs.pop('latitude', Decimal('1.3000000')),
        longitude=kwargs.pop('longitude', Decimal('103.8000000')),
        phone=kwargs.pop('phone', '61234567'),
        website=kwargs.pop('website', 'https://example.com'),
        email=kwargs.pop('email', user.email),
        opening_hours=kwargs.pop('opening_hours', 'Mon-Sun 10am-10pm'),
        is_approved=approved,
        **kwargs,
    )


def create_experience(vendor=None, **kwargs):
    vendor = vendor or create_vendor_profile()
    title = kwargs.pop('title', f'Food Tour {_next("exp")}')
    return FoodExperience.objects.create(
        vendor=vendor,
        title=title,
        description=kwargs.pop('description', 'A guided food tour.'),
        category=kwargs.pop('category', 'food_tour'),
        price=kwargs.pop('price', Decimal('88.00')),
        currency=kwargs.pop('currency', 'SGD'),
        capacity=kwargs.pop('capacity', 10),
        duration_hours=kwargs.pop('duration_hours', Decimal('3.0')),
        available_from=kwargs.pop('available_from', date.today()),
        available_to=kwargs.pop('available_to', date.today() + timedelta(days=30)),
        start_time=kwargs.pop('start_time', time(10, 0)),
        meeting_point=kwargs.pop('meeting_point', 'Chinatown MRT'),
        what_included=kwargs.pop('what_included', 'Food tastings'),
        what_to_bring=kwargs.pop('what_to_bring', 'Water bottle'),
        is_active=kwargs.pop('is_active', True),
        is_featured=kwargs.pop('is_featured', False),
        **kwargs,
    )


def create_booking(tourist=None, experience=None, status='confirmed', **kwargs):
    tourist = tourist or create_user(role='tourist')
    experience = experience or create_experience()
    return Booking.objects.create(
        tourist=tourist,
        experience=experience,
        booking_date=kwargs.pop('booking_date', date.today() + timedelta(days=2)),
        booking_time=kwargs.pop('booking_time', time(18, 0)),
        num_guests=kwargs.pop('num_guests', 2),
        special_requests=kwargs.pop('special_requests', 'Window seat'),
        status=status,
        **kwargs,
    )


def create_itinerary(tourist=None, **kwargs):
    tourist = tourist or create_user(role='tourist')
    return Itinerary.objects.create(
        tourist=tourist,
        title=kwargs.pop('title', 'Weekend Food Plan'),
        description=kwargs.pop('description', 'A food-focused weekend'),
        start_date=kwargs.pop('start_date', date.today()),
        end_date=kwargs.pop('end_date', date.today() + timedelta(days=1)),
        is_public=kwargs.pop('is_public', True),
        **kwargs,
    )


def create_itinerary_item(itinerary=None, experience=None, **kwargs):
    itinerary = itinerary or create_itinerary()
    experience = experience or create_experience()
    return ItineraryItem.objects.create(
        itinerary=itinerary,
        experience=experience,
        day_number=kwargs.pop('day_number', 1),
        order=kwargs.pop('order', 1),
        notes=kwargs.pop('notes', 'Start here'),
        planned_time=kwargs.pop('planned_time', time(9, 30)),
        **kwargs,
    )


def create_blog_post(author=None, category=None, published=True, **kwargs):
    author = author or create_user(role='admin')
    category = category or BlogCategory.objects.create(
        name=kwargs.pop('category_name', f'Guides {_next("cat")}'),
        slug=kwargs.pop('category_slug', f'guides-{_counter}'),
        description='Travel guides',
    )
    title = kwargs.pop('title', f'Blog Post {_next("blog")}')
    slug = kwargs.pop('slug', title.lower().replace(' ', '-'))
    return BlogPost.objects.create(
        author=author,
        category=category,
        title=title,
        slug=slug,
        excerpt=kwargs.pop('excerpt', 'Short excerpt'),
        content=kwargs.pop('content', 'Long form blog content'),
        is_published=published,
        is_featured=kwargs.pop('is_featured', False),
        **kwargs,
    )


def create_page(**kwargs):
    return Page.objects.create(
        title=kwargs.pop('title', 'About TasteLocal'),
        slug=kwargs.pop('slug', f'page-{_next("page")}'),
        content=kwargs.pop('content', 'Page content'),
        meta_description=kwargs.pop('meta_description', 'Meta description'),
        is_published=kwargs.pop('is_published', True),
        **kwargs,
    )
