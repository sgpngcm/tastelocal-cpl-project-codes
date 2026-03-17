"""Views for static pages."""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Page, ContactMessage
from .serializers import PageSerializer, ContactMessageSerializer


class PageDetailView(generics.RetrieveAPIView):
    """Get a page by slug."""
    serializer_class = PageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    queryset = Page.objects.filter(is_published=True)


class ContactSubmitView(generics.CreateAPIView):
    """Submit a contact form message."""
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        # Send email notification
        try:
            send_mail(
                f'TasteLocal Contact: {message.subject}',
                f"From: {message.name} ({message.email})\n\n{message.message}",
                settings.DEFAULT_FROM_EMAIL,
                [settings.EMAIL_HOST_USER],
                fail_silently=True,
            )
        except Exception:
            pass
        return Response(
            {'message': 'Thank you for contacting us! We will get back to you shortly.'},
            status=status.HTTP_201_CREATED
        )


class AdminContactListView(generics.ListAPIView):
    """Admin: list contact messages."""
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = ContactMessage.objects.all()
