"""Generate richer demo imagery and content for TasteLocal seed data."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from blog.models import BlogPost
from experiences.models import ExperienceImage, FoodExperience
from tastelocal.demo_seed_assets import build_avatar, build_card_image, palette_for_index
from vendors.models import VendorPhoto, VendorProfile

User = get_user_model()

ROLE_BIOS = {
    'admin': 'Platform administrator keeping TasteLocal polished, trustworthy, and ready for demo storytelling.',
    'vendor': 'Local food host sharing Singapore through recipes, neighbourhood stories, and memorable dining moments.',
    'tourist': 'Curious traveler collecting authentic local bites, hidden gems, and bookable experiences across Singapore.',
}


class Command(BaseCommand):
    help = 'Generate demo images and richer text defaults for seeded users, vendors, experiences, and blog posts.'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Overwrite existing generated images and text defaults.')

    def handle(self, *args, **options):
        self.force = options['force']
        self.stdout.write('Generating visual seed content...')
        self.seed_users()
        self.seed_vendors()
        self.seed_experiences()
        self.seed_blog_posts()
        self.stdout.write(self.style.SUCCESS('Visual seed content generated successfully.'))

    def seed_users(self):
        updated = 0
        for index, user in enumerate(User.objects.all().order_by('id')):
            changed = False
            full_name = user.display_name or user.username
            if self.force or not user.profile_image:
                user.profile_image.save(
                    f'{slugify(user.username)}-avatar.png',
                    build_avatar(full_name, filename=f'{slugify(user.username)}-avatar.png'),
                    save=False,
                )
                changed = True
            if self.force or not user.bio:
                home = ', '.join(part for part in [user.city, user.country] if part)
                suffix = f' Based in {home}.' if home else ''
                user.bio = ROLE_BIOS.get(user.role, 'TasteLocal community member.') + suffix
                changed = True
            if changed:
                user.save()
                updated += 1
        self.stdout.write(f'  Updated {updated} user profiles')

    def seed_vendors(self):
        updated = 0
        photo_count = 0
        for index, vendor in enumerate(VendorProfile.objects.select_related('user').all().order_by('id')):
            changed = False
            palette = palette_for_index(index)
            if self.force or not vendor.cover_image:
                vendor.cover_image.save(
                    f'{slugify(vendor.business_name)}-cover.png',
                    build_card_image(
                        title=vendor.business_name,
                        subtitle=vendor.address,
                        badge='Trusted Vendor',
                        palette=palette,
                        filename=f'{slugify(vendor.business_name)}-cover.png',
                    ),
                    save=False,
                )
                changed = True
            if self.force or not vendor.logo:
                vendor.logo.save(
                    f'{slugify(vendor.business_name)}-logo.png',
                    build_avatar(vendor.business_name, filename=f'{slugify(vendor.business_name)}-logo.png'),
                    save=False,
                )
                changed = True
            if self.force or not vendor.opening_hours:
                vendor.opening_hours = 'Mon-Thu: 10:00 AM - 8:30 PM | Fri-Sun: 9:00 AM - 10:00 PM'
                changed = True
            if changed:
                vendor.save()
                updated += 1

            existing_photos = vendor.photos.count()
            target_photos = 2
            for offset in range(existing_photos, target_photos):
                photo = VendorPhoto(vendor=vendor, caption=f'{vendor.business_name} atmosphere {offset + 1}', is_primary=(offset == 0))
                photo.image.save(
                    f'{slugify(vendor.business_name)}-photo-{offset + 1}.png',
                    build_card_image(
                        title=vendor.business_name,
                        subtitle=f'{vendor.get_cuisine_type_display()} • {vendor.address}',
                        badge='Vendor Gallery',
                        palette=palette_for_index(index + offset + 1),
                        filename=f'{slugify(vendor.business_name)}-photo-{offset + 1}.png',
                    ),
                    save=True,
                )
                photo_count += 1
        self.stdout.write(f'  Updated {updated} vendors and created {photo_count} vendor gallery images')

    def seed_experiences(self):
        updated = 0
        gallery_count = 0
        for index, experience in enumerate(FoodExperience.objects.select_related('vendor').all().order_by('id')):
            changed = False
            palette = palette_for_index(index)
            if self.force or not experience.image:
                experience.image.save(
                    f'{slugify(experience.title)}-hero.png',
                    build_card_image(
                        title=experience.title,
                        subtitle=f'{experience.vendor.business_name} • {experience.get_category_display()}',
                        badge='TasteLocal Experience',
                        palette=palette,
                        filename=f'{slugify(experience.title)}-hero.png',
                    ),
                    save=False,
                )
                changed = True
            if self.force or not experience.meeting_point:
                experience.meeting_point = experience.vendor.address
                changed = True
            if self.force or not experience.what_included:
                experience.what_included = '\n'.join([
                    'Guided hosting by a local expert',
                    'Tasting portions or ingredients for the full session',
                    'Cultural storytelling and neighbourhood context',
                    'Digital follow-up recommendations after the experience',
                ])
                changed = True
            if self.force or not experience.what_to_bring:
                experience.what_to_bring = '\n'.join([
                    'Comfortable walking shoes',
                    'A reusable water bottle',
                    'Phone or camera for photos',
                    'An appetite for local flavours',
                ])
                changed = True
            if changed:
                experience.save()
                updated += 1

            existing_images = experience.images.count()
            for offset in range(existing_images, 2):
                gallery = ExperienceImage(experience=experience, caption=f'{experience.title} gallery {offset + 1}', order=offset)
                gallery.image.save(
                    f'{slugify(experience.title)}-gallery-{offset + 1}.png',
                    build_card_image(
                        title=experience.title,
                        subtitle=f'{experience.vendor.business_name} • {experience.get_category_display()}',
                        badge='Experience Gallery',
                        palette=palette_for_index(index + offset + 2),
                        filename=f'{slugify(experience.title)}-gallery-{offset + 1}.png',
                    ),
                    save=True,
                )
                gallery_count += 1
        self.stdout.write(f'  Updated {updated} experiences and created {gallery_count} gallery images')

    def seed_blog_posts(self):
        updated = 0
        for index, post in enumerate(BlogPost.objects.all().order_by('id')):
            if self.force or not post.cover_image:
                post.cover_image.save(
                    f'{slugify(post.slug)}-cover.png',
                    build_card_image(
                        title=post.title,
                        subtitle=post.excerpt or 'TasteLocal editorial story',
                        badge='TasteLocal Journal',
                        palette=palette_for_index(index + 3),
                        filename=f'{slugify(post.slug)}-cover.png',
                    ),
                    save=False,
                )
                post.save()
                updated += 1
        self.stdout.write(f'  Updated {updated} blog covers')
