# TasteLocal Upgrade Notes

## What was analyzed
- Django + DRF backend with apps for accounts, vendors, experiences, bookings, reviews, itineraries, pages, and blog.
- React + Vite + Tailwind frontend with public browsing pages and role-based dashboards.
- Existing seed flow already created records, but the demo presentation still depended heavily on missing or weak media content.
- Map experience previously depended on a generic search-style embed instead of actual vendor marker data.

## Main problems found
1. **Media URL handling was brittle** when frontend and backend run on different hosts/ports.
2. **Public browsing pages were functional but visually flat** for a food/travel marketplace.
3. **Seed data lacked rich visual assets** for users, vendors, experiences, galleries, and blog content.
4. **Map browsing was not using vendor records as the primary experience.**
5. `backend/vendors/views.py` had a missing `django.db.models` import for search queries.

## What was upgraded

### Frontend visualization
- Added `frontend/src/utils/media.js`
  - resolves backend media URLs reliably
  - provides SVG fallback visuals for avatars, vendors, experiences, and blog cards
- Reworked public-facing pages for a more editorial, travel-led presentation:
  - `HomePage.jsx`
  - `ExperienceListPage.jsx`
  - `ExperienceDetailPage.jsx`
  - `VendorListPage.jsx`
  - `VendorDetailPage.jsx`
  - `BlogListPage.jsx`
  - `BlogDetailPage.jsx`
  - `MapPage.jsx`
  - `ExperienceCard.jsx`
  - `Header.jsx`
- Improved authenticated pages that display user or experience images:
  - `ProfilePage.jsx`
  - `vendor/VendorListings.jsx`
  - `tourist/TouristBookings.jsx`

### Seed data and visual assets
- Added `backend/tastelocal/demo_seed_assets.py`
  - generates branded PNG images locally with Pillow
- Added management command:
  - `python manage.py seed_visual_content`
- This command upgrades seeded content by generating:
  - user avatars + role-aware bios
  - vendor covers + logos + gallery images
  - experience hero images + gallery images + richer itinerary content
  - blog cover images

### Map and vendor enrichment
- Added management command:
  - `python manage.py enrich_google_places --only-missing`
- This uses the **official Google Places API** to improve vendor seed records with:
  - formatted address
  - latitude / longitude
  - website
  - opening hours
- This is safer and more maintainable than scraping Google Maps pages directly.

### Backend fix
- Patched `backend/vendors/views.py` by adding the missing import:
  - `from django.db import models`

## Recommended run order
```bash
cd backend
python manage.py migrate
python manage.py seed_data
python manage.py seed_visual_content
# Optional when GOOGLE_MAPS_API_KEY is configured
python manage.py enrich_google_places --only-missing
```

## Notes
- The new visual seed command does not require external image URLs.
- Google Places enrichment requires a valid Google Maps Platform API key and billing-enabled project.
- Frontend package installation/build was not fully executed in this environment because external npm package download was unavailable here, so final runtime verification should be done locally after `npm install`.
