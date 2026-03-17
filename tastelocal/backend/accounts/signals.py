"""Signals for accounts app - email notifications."""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)


def send_welcome_email(user):
    """Send welcome email after registration."""
    try:
        subject = f'Welcome to TasteLocal, {user.display_name}!'
        message = (
            f"Hi {user.display_name},\n\n"
            f"Welcome to TasteLocal - your gateway to authentic local food experiences!\n\n"
            f"Your account has been created successfully as a {user.get_role_display()}.\n\n"
        )
        if user.role == 'vendor':
            message += (
                "As a vendor, you can now:\n"
                "- Create your business profile\n"
                "- List your food experiences\n"
                "- Manage bookings from tourists\n\n"
                "Your profile will be visible once approved by our admin team.\n\n"
            )
        elif user.role == 'tourist':
            message += (
                "As a tourist, you can now:\n"
                "- Discover authentic local food experiences\n"
                "- Book food tours and dining experiences\n"
                "- Create personalized food itineraries\n"
                "- Leave reviews for experiences you've enjoyed\n\n"
            )
        message += (
            "Start exploring at: " + settings.CORS_ALLOWED_ORIGINS[0] + "\n\n"
            "Happy eating!\n"
            "The TasteLocal Team"
        )
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {e}")


def send_booking_confirmation_email(booking):
    """Send booking confirmation email."""
    try:
        subject = f'Booking Confirmed - {booking.experience.title}'
        message = (
            f"Hi {booking.tourist.display_name},\n\n"
            f"Your booking has been confirmed!\n\n"
            f"Details:\n"
            f"Experience: {booking.experience.title}\n"
            f"Vendor: {booking.experience.vendor.business_name}\n"
            f"Date: {booking.booking_date.strftime('%B %d, %Y')}\n"
            f"Time: {booking.booking_time.strftime('%I:%M %p') if booking.booking_time else 'TBD'}\n"
            f"Guests: {booking.num_guests}\n"
            f"Status: {booking.get_status_display()}\n\n"
            f"If you need to modify or cancel your booking, please visit your dashboard.\n\n"
            f"Enjoy your experience!\n"
            f"The TasteLocal Team"
        )
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [booking.tourist.email],
            fail_silently=True,
        )
        # Notify vendor
        vendor_message = (
            f"Hi {booking.experience.vendor.user.display_name},\n\n"
            f"You have a new booking!\n\n"
            f"Details:\n"
            f"Experience: {booking.experience.title}\n"
            f"Guest: {booking.tourist.display_name}\n"
            f"Date: {booking.booking_date.strftime('%B %d, %Y')}\n"
            f"Guests: {booking.num_guests}\n\n"
            f"Please check your vendor dashboard for details.\n\n"
            f"The TasteLocal Team"
        )
        send_mail(
            f'New Booking - {booking.experience.title}',
            vendor_message,
            settings.DEFAULT_FROM_EMAIL,
            [booking.experience.vendor.user.email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send booking email: {e}")


def send_itinerary_email(itinerary):
    """Send itinerary creation confirmation."""
    try:
        items = itinerary.items.select_related('experience__vendor').all()
        item_list = "\n".join([
            f"  - {item.experience.title} ({item.experience.vendor.business_name})"
            for item in items
        ])
        subject = f'Your Itinerary: {itinerary.title}'
        message = (
            f"Hi {itinerary.tourist.display_name},\n\n"
            f"Your itinerary '{itinerary.title}' has been saved!\n\n"
            f"Planned experiences:\n{item_list}\n\n"
            f"Share your itinerary: {settings.CORS_ALLOWED_ORIGINS[0]}/itinerary/{itinerary.share_uuid}\n\n"
            f"Happy exploring!\n"
            f"The TasteLocal Team"
        )
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [itinerary.tourist.email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Failed to send itinerary email: {e}")
