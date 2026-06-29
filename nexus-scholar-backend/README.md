# ⚡ NEXUS SCHOLAR — Backend API

> AI-Powered Scholarship Intelligence Platform for International Students

Built with: **NestJS · PostgreSQL · Prisma · BullMQ · Redis · Claude AI · Playwright**

---

## Quick Start

```bash
# 1. Clone & install
npm install

# 2. Configure environment
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, DATABASE_URL, REDIS_URL, JWT_SECRET

# 3. Start infrastructure
docker-compose up postgres redis -d

# 4. Run migrations & generate Prisma client
npm run db:migrate
npm run db:generate

# 5. Start dev server
npm run start:dev
```

API docs available at: `http://localhost:3000/api/docs`

---

## Architecture

```
src/
├── main.ts                    # NestJS bootstrap, Swagger, CORS
├── app.module.ts              # Root module
├── prisma/                    # Global database service
├── ai/                        # Claude AI integration
│   ├── ai.service.ts          # Extraction, chat, verification, timeline
│   └── ai.controller.ts       # POST /api/ai/chat|verify|timeline
├── scholarships/              # Core scholarship intelligence
│   ├── scholarships.service.ts # Filter, score, calendar
│   └── scholarships.controller.ts  # GET /api/scholarships
├── scraping/                  # Automated data collection
│   ├── scraping.service.ts    # Cron jobs, source registry, hash diffing
│   ├── scraping.processor.ts  # BullMQ worker
│   └── scraping.controller.ts # Admin trigger endpoints
├── auth/                      # JWT auth
│   ├── auth.service.ts        # Register, login, refresh
│   └── jwt.strategy.ts        # Passport-JWT
├── users/                     # User profiles + application tracker
│   └── users.service.ts       # Profile, tracker, doc checklist, AI timeline
└── notifications/             # Email deadline reminders
    └── notifications.service.ts  # Nodemailer + cron at 8 AM daily
```

---

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scholarships` | List/filter scholarships (ieltsRequired, tiers, fields, minScore) |
| GET | `/api/scholarships/calendar` | Upcoming deadlines |
| GET | `/api/scholarships/:slug` | Scholarship detail |
| POST | `/api/ai/chat` | AI consultant (web-search enabled) |
| POST | `/api/ai/verify` | Verify scholarship is active |
| POST | `/api/ai/timeline` | Generate application timeline |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login → JWT tokens |
| GET | `/api/users/applications` | Tracked applications |
| POST | `/api/users/applications` | Track a scholarship |
| PATCH | `/api/users/applications/:id/status` | Move status |
| PATCH | `/api/users/applications/:id/docs` | Update doc checklist |
| GET | `/api/users/timeline` | AI-generated personal timeline |
| GET | `/api/admin/scraping/status` | Scraper health |
| POST | `/api/admin/scraping/trigger` | Manual scrape trigger |

---

## Scraping Sources (10 Official Portals)

- 🇹🇷 Türkiye Bursları (scraped every 6h)
- 🇨🇳 China CSC (scraped every 6h)
- 🇭🇺 Stipendium Hungaricum (scraped every 6h)
- 🇰🇷 KGSP Korea (scraped every 6h)
- 🇯🇵 MEXT Japan (scraped every 6h)
- 🇩🇪 DAAD Germany (scraped every 6h)
- 🇲🇾 MIS Malaysia (scraped daily)
- 🇵🇱 NAWA Poland (scraped daily)
- Scholars4Dev (scraped daily)
- AfterSchoolAfrica (scraped daily)

---

## Student Profile (Default Scoring Baseline)

The suitability scoring engine is pre-tuned for:
- 🇵🇰 Pakistani national | 18yo | ICS Stream
- Target: Bachelor's in CS / AI / Cybersecurity
- **IELTS-FREE strategy** (MOI + English Cert)
- TIER ALPHA countries prioritized: TR, CN, HU, KR, JP, DE, MY, PL, SA, AE, QA

---

## Environment Variables

See `.env.example` for all required config.
Critical: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`
