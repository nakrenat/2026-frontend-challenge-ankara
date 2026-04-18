# Missing Podo — The Ankara Case

> A real-time investigation dashboard built for the **Jotform 2026 Frontend Challenge**.
> Podo was last seen at Ankara Kalesi on 18-04-2026 at 21:11.

---

## Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm 9+

---

## Run Locally

```bash
npm install
npm run dev
```

Create your local env file:

```bash
# macOS / Linux
cp .env.example .env.local
```

```powershell
# Windows
copy .env.example .env.local
```

Open [http://localhost:5173](http://localhost:5173)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Maps | Leaflet + React Leaflet |
| Data | Jotform REST API (5 forms) |

---

## Investigation Model

Five independent Jotform forms are merged into one `Person` domain model:

- Check-ins
- Messages
- Sightings
- Personal Notes
- Anonymous Tips

Data flow:

1. Fetch all submissions per form
2. Parse to typed raw records
3. `buildPeople()` merges records using fuzzy name matching
4. Score each person (`0–100`) and assign suspicion level
5. Render timeline + map + suspect panels

---

## UX Highlights

- Sidebar suspect list with search and suspicion badges
- Person detail panel with filterable timeline
- Map + timeline hover synchronization
- Split / map / timeline desktop modes
- Mobile tabs for people, detail, and map
- Legend and high-risk marker pulse on map
- Stats bars for both desktop and mobile

---

## Reliability & Error Handling

- Retry with exponential backoff for retryable API failures (429 / 5xx)
- Partial-load strategy with `Promise.allSettled` (one source can fail without crashing whole UI)
- Clear error panel with recovery checklist

### Known Issue

- If Jotform API rate limiting occurs (`429`), wait briefly and retry; the app already applies automatic backoff for retryable requests.

---

## Quick Validation

- App opens at `http://localhost:5173` and initial data loads.
- Selecting a person in the sidebar updates the detail panel.
- Hovering map markers and timeline events highlights/syncs both sides.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_JOTFORM_API_KEY` | Jotform API key |

Security rules:

- Never commit `.env.local`
- Never hardcode API keys in source files
- `.env.example` is safe and should contain only placeholders
