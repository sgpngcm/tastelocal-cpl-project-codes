# 🍜 TasteLocal - Local Food Tourism Platform

A full-stack web application connecting tourists with authentic local food experiences in Singapore.

## Tech Stack
- **Backend**: Django 4.2 + Django REST Framework + MySQL 8.0
- **Frontend**: React 18 + Vite 6 + Tailwind CSS 3.4
- **Auth**: JWT (SimpleJWT)
- **Maps**: Google Maps Platform API
- **Email**: Gmail SMTP (tastelocal2@gmail.com)

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Edit with your credentials
# Create MySQL database: CREATE DATABASE tastelocal_db CHARACTER SET utf8mb4;
python manage.py migrate
python manage.py seed_data            # Seeds the core demo records
python manage.py seed_visual_content  # Adds generated demo images + richer bios/gallery content
# Optional: enrich vendor coordinates + website/opening hours from the official Google Places API
# python manage.py enrich_google_places --only-missing
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # Starts at http://localhost:5173
```

## Demo Accounts
| Role    | Username      | Password         |
|---------|--------------|------------------|
| Admin   | admin        | TasteLocal2026!  |
| Vendor  | tina_morales | Vendor2026!      |
| Tourist | sam_lee      | Tourist2026!     |

## Features
- 🔐 Role-based access (Admin, Vendor, Tourist)
- 🔍 Experience search with multi-criteria filtering
- 📅 3-step booking flow with email confirmation
- ⭐ Verified review system (booking-gated)
- 🗺️ Interactive Google Maps with vendor pins
- 📋 Personalized itinerary planner with shareable links
- 👨‍🍳 Vendor self-service portal with approval workflow
- 📊 Admin analytics dashboard
- 📝 Blog with categories
- 📄 Full static pages (About, Privacy, Terms, FAQ, Contact, Sitemap)
- 📧 Gmail SMTP email notifications
- 📱 Fully responsive design

## Demo Content Enhancements
- `python manage.py seed_visual_content` generates local demo images for users, vendors, experiences, galleries, and blog posts so the UI looks complete without external placeholder URLs.
- `python manage.py enrich_google_places --only-missing` uses the official Google Places API to fill vendor coordinates, addresses, websites, and opening hours when a valid `GOOGLE_MAPS_API_KEY` is configured.
- The frontend now resolves backend media URLs correctly when Vite and Django run on different hosts.
