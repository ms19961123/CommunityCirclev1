# CommunityCircle

**Local, family-friendly, screen-light community meetup platform.**

CommunityCircle helps busy parents discover and host safe offline activities — walks, playground meetups, library story times, craft swaps, stroller walks, and more — right in their neighborhood.

## Features

- **Local-Only Discovery** — Events shown by distance with radius filtering (1–25 miles). No global feed.
- **Safety First** — Trust badges, email/phone verification, reporting, blocking, admin moderation.
- **Screen-Light Mode** — After RSVP, minimal UI nudges you to put the phone down and enjoy.
- **Multi-Step Event Creation** — Wizard with validation, content moderation, and rate limiting.
- **Community Guidelines** — Apolitical, anti-hate, family-friendly content policies enforced via moderation.
- **Admin Dashboard** — Reports queue, flagged content, user management, analytics charts.
- **Popular Activities Dashboard** — Real charts aggregating RSVPs by category and events over time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Charts | Recharts |
| Forms | react-hook-form + Zod |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials provider) |
| Unit Tests | Vitest |
| E2E Tests | Playwright |
| Tooling | ESLint + Prettier |

## Prerequisites

- **Node.js** 18+ (20 recommended)
- **npm** 9+
- **Docker** and **Docker Compose** (for PostgreSQL, or use your own Postgres)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd communitycircle
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` if needed. Defaults work with Docker Compose.

### 3. Start Database

```bash
docker compose up db -d
```

Or use your own PostgreSQL instance and update `DATABASE_URL` in `.env`.

### 4. Run Migrations & Seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

This creates the database schema and populates it with demo data:
- 1 admin, 5 hosts, 3 regular users
- 15 events across Philadelphia
- 30 RSVPs, 10 messages, 5 reports, 10 feedback entries

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@communitycircle.local | password123! |
| Host | host1@communitycircle.local | password123! |
| Host | host2@communitycircle.local | password123! |
| User | user1@communitycircle.local | password123! |

## Running Tests

### Unit Tests (Vitest)

```bash
npm test
```

### E2E Tests (Playwright)

```bash
npx playwright install chromium
npm run test:e2e
```

E2E tests require the dev server to be running with a seeded database.

## Docker Deployment

### Full Stack with Docker Compose

```bash
docker compose up --build
```

This starts both PostgreSQL and the Next.js app. Then run migrations:

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

### Production Deployment (Vercel)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set environment variables:
   - `DATABASE_URL` — Use a hosted PostgreSQL (Neon, Supabase, Railway)
   - `NEXTAUTH_SECRET` — Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — Your production URL
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Design tokens & Tailwind
│   ├── (public)/                   # Public pages
│   │   ├── guidelines/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── help/page.tsx
│   ├── auth/                       # Auth pages
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── onboarding/page.tsx         # Onboarding stepper
│   ├── app/                        # Authenticated app
│   │   ├── page.tsx                # Feed (Nearby/Popular/For You)
│   │   ├── layout.tsx              # App shell with nav
│   │   ├── map/page.tsx            # Neighborhood grid view
│   │   ├── events/
│   │   │   ├── [id]/page.tsx       # Event detail + RSVP
│   │   │   ├── [id]/manage/page.tsx # Host management
│   │   │   └── create/page.tsx     # Multi-step create wizard
│   │   ├── profile/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── messages/page.tsx
│   │   └── reports/new/page.tsx
│   ├── admin/page.tsx              # Admin dashboard
│   └── api/                        # API routes
│       ├── auth/[...nextauth]/     # NextAuth
│       ├── events/                 # CRUD + RSVP + checkin
│       ├── threads/                # Messaging
│       ├── reports/                # User reports
│       ├── blocks/                 # User blocking
│       ├── admin/                  # Admin actions
│       ├── analytics/              # Charts data
│       └── ...
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── nav/                        # Navigation components
│   ├── event-card.tsx
│   ├── event-filters.tsx
│   ├── trust-badge.tsx
│   ├── offline-nudge.tsx
│   ├── report-dialog.tsx
│   ├── category-icon.tsx
│   └── empty-state.tsx
├── lib/
│   ├── db.ts                       # Prisma client
│   ├── auth.ts                     # NextAuth config
│   ├── geo.ts                      # Haversine + bounding box
│   ├── moderation.ts               # Content checks
│   ├── validations.ts              # Zod schemas
│   └── utils.ts                    # cn() helper
prisma/
├── schema.prisma                   # Database schema
└── seed.ts                         # Demo data
```

## Customization

### Brand Name
Search and replace "CommunityCircle" across the codebase.

### Color Palette
Edit CSS variables in `src/app/globals.css`:
- `--primary`: Teal (174 60% 40%)
- `--secondary`: Sunny yellow (45 93% 58%)
- `--accent`: Coral (24 95% 53%)

Custom color scales in `tailwind.config.ts` under `theme.extend.colors`.

### Seed Location
Edit `prisma/seed.ts` — change the Philadelphia coordinates and place names:
- Default lat: 39.9526
- Default lng: -75.1652
- Update `NEIGHBORHOODS` in `src/app/app/map/page.tsx`

### Content Moderation
Edit word lists in `src/lib/moderation.ts`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/communitycircle` |
| `NEXTAUTH_SECRET` | JWT signing secret | (required) |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |
| `DEFAULT_CITY` | Default city for new users | `Philadelphia` |
| `DEFAULT_LAT` | Default latitude | `39.9526` |
| `DEFAULT_LNG` | Default longitude | `-75.1652` |

## Verification (Dev Mode)

- **Email**: Click "Verify Email" button — instantly verified (no real email sent)
- **Phone**: Enter code `123456` — instantly verified (no real SMS sent)
- **ID**: Placeholder UI — "Coming Soon"

## Known Limitations & Next Steps

- [ ] Real email verification (SendGrid, Resend, etc.)
- [ ] Real SMS/phone verification (Twilio, etc.)
- [ ] Real ID verification integration
- [ ] Interactive map with Mapbox or Google Maps
- [ ] Push notifications (web + mobile)
- [ ] Image uploads for events and profiles
- [ ] Real-time messaging (WebSocket or SSE)
- [ ] Full-text search for events
- [ ] Calendar integration (ICS export)
- [ ] Mobile app (React Native or PWA)

## License

MIT
#   C o m m u n i t y C i r c l e v 1  
 