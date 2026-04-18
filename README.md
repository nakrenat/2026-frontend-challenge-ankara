# Missing Podo — The Ankara Case

> A real-time investigation dashboard built for the **Jotform 2026 Frontend Challenge**.
> Podo was last seen at Ankara Kalesi on 18-04-2026 at 21:11.

---

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
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

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_JOTFORM_API_KEY` | Jotform API key |

Security rules:

- Never commit `.env.local`
- Never hardcode API keys in source files
- `.env.example` is safe and should contain only placeholders
