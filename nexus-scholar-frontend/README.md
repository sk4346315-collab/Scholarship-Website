# ⚡ NEXUS SCHOLAR — Frontend

React + Vite frontend for the NEXUS SCHOLAR AI Scholarship Intelligence Platform.

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Fill in VITE_API_URL and VITE_ANTHROPIC_KEY

# 3. Run locally
npm run dev
# → http://localhost:5173
```

## Project Structure

```
src/
├── main.jsx              # React entry point
├── App.jsx               # Root shell — header, tabs, auth modal, global state
├── api/
│   ├── client.js         # Fetch wrapper with JWT auto-refresh
│   ├── auth.api.js       # Register, login, logout
│   ├── users.api.js      # Profile, tracker, doc checklist
│   ├── scholarships.api.js  # List/filter from backend DB
│   └── ai.api.js         # Claude AI — search + consultant (direct browser calls)
├── context/
│   └── AuthContext.jsx   # Global auth state (user, login, logout, isLoggedIn)
├── components/
│   ├── AuthModal.jsx     # Login/Register modal
│   ├── ScholarCard.jsx   # Scholarship result card
│   ├── DCSBadge.jsx      # Data Confidence Score indicator
│   ├── DeadlineBadge.jsx # Days-until-deadline countdown
│   └── DocChecklist.jsx  # Checkable document list with progress bar
├── pages/
│   ├── Home.jsx          # Dashboard — stats, deadline countdown, quick actions
│   ├── Discover.jsx      # Scholarship search — filters + AI search
│   ├── Consultant.jsx    # AI chat (Claude with web search)
│   ├── Tracker.jsx       # Application tracker with doc checklists
│   └── Profile.jsx       # Student profile + recommended strategy
└── data/
    └── seed.js           # 6 verified scholarships — shown without API call
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL — `https://nexus-scholar-api.onrender.com` |
| `VITE_ANTHROPIC_KEY` | Your Anthropic API key for AI features |

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Add env vars in Vercel dashboard → Project Settings → Environment Variables.

## Key Architecture Decisions

- **AI calls go direct from browser** → no backend proxy needed for Discover + Consultant
- **JWT stored in sessionStorage** → clears when tab closes, no XSS risk from localStorage
- **Seed data always visible** → app works as guest without login or backend
- **Tracker syncs to backend** when user is logged in, otherwise memory-only
