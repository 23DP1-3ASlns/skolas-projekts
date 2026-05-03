# PRD — Zālītes pamatskola Website

## Original Problem Statement
Build a full-stack web application for Zālītes pamatskola (Latvian school) with:
- Public-facing site (Sākums, Jaunumi, Vēsture, Kontakti, Skolēniem, Skolotājiem, Stundas saraksts)
- Secure admin panel for managing news, schedule, page content, and admin users
- Modern, responsive, vibrant UI with smooth animations
- JWT-based admin auth with bcrypt password hashing
- Image uploads for news, dark mode toggle, conflict detection in schedule

## User Choices (Feb 2026)
- Auth: JWT email/password (custom)
- Database: MongoDB (platform constraint — PostgreSQL not available)
- Design: Modern & vibrant
- Optional features: Image upload + dark mode toggle
- Admin account: default seeded test account
- School name: **Zālītes pamatskola**

## Architecture
- Backend: FastAPI + Motor (async MongoDB) + bcrypt + PyJWT
- Frontend: React 19 + React Router 7 + Tailwind + Shadcn UI + Lucide icons
- Auth: JWT in httpOnly cookie + Bearer token fallback in localStorage
- Images: stored as base64 data URLs in MongoDB

## Personas
- **Skolēni & vecāki**: browse news, view schedule, read about school
- **Skolotāji**: read teacher info, view schedule
- **Administrators**: log in, manage all content

## Implemented (2026-02-03)
### Backend (`/app/backend/server.py`)
- POST `/api/auth/login`, `/api/auth/logout`, GET `/api/auth/me`
- News CRUD: GET/POST/PUT/DELETE `/api/news[/:id]`
- Schedule CRUD: GET/POST/PUT/DELETE `/api/schedule[/:id]`, GET `/api/schedule/groups`, GET `/api/schedule/conflicts`
- Pages: GET/PUT `/api/pages/{slug}` (history, students, teachers, contacts)
- Users: GET/POST/DELETE `/api/users`
- Auto-seeding on startup: 1 admin, 4 page contents, 3 news posts, 14 schedule entries
- MongoDB unique indexes on email, ids, slug
- Conflict detection: same teacher OR same group at overlapping time on same day

### Frontend
- Public layout with sticky glass navbar (slide-in hover effect), full-width footer
- Pages: Home (hero + intro + quick links + latest news), News (grid + search), History, Students, Teachers, Schedule (5-day grid + class filter), Contacts
- Admin layout with sidebar (Pārskats, Jaunumi, Stundu saraksts, Lapu saturs, Lietotāji, Logout)
- Admin login at `/admin/login` with split-screen design
- Admin Dashboard with 5 stat cards (incl. Konflikti)
- Admin News with image upload (base64), CRUD with confirm dialogs
- Admin Schedule with conflict highlight (red rows), filter by class
- Admin Content tabs editor for 4 pages
- Admin Users management with self/last-admin protection
- Dark mode toggle with persistent preference

### Design System
- Primary `#2563EB` (blue), Secondary `#FF6B6B` (coral)
- Fonts: Outfit (headings), DM Sans (body)
- Glassmorphism navbar, gradient hero, card hover lift, slide-in nav links

## Test Status
- Backend: 21/21 pytest tests passed
- Frontend: All public + admin flows verified working

## Backlog (P1)
- Image optimization (currently storing full base64 in MongoDB; consider CDN or compression for very large libraries)
- Forgot password flow
- News detail page with comments
- Email notifications for admins on user create
- More granular roles beyond single "admin"

## Backlog (P2)
- Multi-language toggle (LV/EN)
- Calendar view for schedule
- Brute-force lockout (5 fails = 15 min lockout)
- Audit log for admin actions

## Test Credentials
- See `/app/memory/test_credentials.md`
