# TasteLocal unit test pack

This pack adds a focused automated test suite for the Django backend and the React frontend.

## What is covered

### Backend
- auth registration and login
- vendor profile creation, public listing, map data, and my-profile payload
- experience creation and public listing rules
- booking creation, permission checks, and cancellation rules
- review eligibility and duplicate prevention
- itinerary creation, sharing, add-item, and remove-item
- blog list/detail behavior
- contact form submission

### Frontend
- media URL / fallback helpers
- protected route behavior
- blog page category handling regression test

## Important note about current project bugs

Two tests are intentionally written against the **intended** behavior and will fail on the current project until you apply the earlier fixes:

1. `backend/vendors/tests.py::VendorProfileApiTests::test_my_profile_get_returns_full_profile_payload`
   - fails because `/api/vendors/my-profile/` currently uses the create/update serializer for `GET`, so `id` is missing.
2. `frontend/src/pages/__tests__/BlogListPage.test.jsx::renders_posts_and_handles_paginated_categories`
   - fails because `BlogListPage.jsx` currently treats category results as a plain array instead of `response.data.results`.

Those failing tests are useful because they lock in the fixes once applied.

## Backend setup

Copy these backend files into your project backend folder, preserving paths.

Run tests with the lightweight SQLite test settings:

```bash
python manage.py test --settings=tastelocal.test_settings
```

## Frontend setup

Install test dependencies in `frontend`:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add these scripts to `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Then run:

```bash
npm test
```
