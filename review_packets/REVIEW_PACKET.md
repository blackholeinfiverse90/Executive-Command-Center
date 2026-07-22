# REVIEW PACKET — Executive Command Center
**Version:** 1.0.0  
**Date:** 2025-07-17  
**Phases Completed:** 1 (Architecture) · 2 (Data) · 3 (Hardening) · 4 (UX + Testing)  
**Status:** Production-ready. Build clean. 77/77 tests passing.

---

## Entry Point

```
npm install
npm run dev        → http://localhost:5173   (development)
npm run build      → dist/                   (production)
npm test           → vitest run              (77 tests)
```

**Environment variables** (`.env` — already committed for local dev):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000/api/v1` | SETU PMC API base |
| `VITE_API_TIMEOUT_MS` | `8000` | Per-request timeout |
| `VITE_USE_MOCK_FALLBACK` | `true` | Fall back to mock data if API unreachable |

With `VITE_USE_MOCK_FALLBACK=true` the dashboard runs fully offline using `src/services/mockData.js`. No backend required to evaluate the UI.

---

## Critical Execution Files (3)

### 1. `src/main.jsx` — Application bootstrap
```
ReactDOM.createRoot
  └── AppErrorBoundary        (top-level crash boundary)
      └── QueryClientProvider (TanStack Query context)
          └── App             (dashboard root)
```
Mounts the React tree. `QueryClient` has no `defaultOptions` — all query config lives in `useCommandData`.

---

### 2. `src/services/adapter.js` — Data translation boundary
The single file that separates SETU API schema from dashboard component contracts.

```
fetchCommandDataWithFallback()
  ├── try: fetchCommandData()          ← calls setuApi.*
  │         ├── setuApi.projects()
  │         ├── setuApi.milestones(id) × N projects  (parallel)
  │         ├── setuApi.projectTasks(id) × N projects (parallel)
  │         └── derives: alerts, risks, resources, decisions,
  │                       activity, dependencies, forecast,
  │                       confidenceHistory, summary
  └── catch: fetchMockData()           ← src/services/mockData.js
             + { dataSource: 'mock-fallback' }
```

**Rule:** Components never import from `setuApi.js` directly. All field mapping lives here. If the SETU schema changes, only this file changes.

---

### 3. `src/store/commandStore.js` — All UX state
Zustand store. Single source of truth for every interaction state.

| Slice | Fields | Purpose |
|---|---|---|
| Panel | `activePanel`, `panelHistory` | L2 DetailPanel — stack-based history |
| Focus | `focusMode`, `focusProjectId`, `focusProjectList` | L3 FocusMode — project switcher |
| Freshness | `lastRefreshed`, `isRefreshPulsing` | F9 auto-refresh pulse, F15 stale warning |
| Overlay | `showShortcuts` | F14 keyboard shortcut modal |

---

## Component Interaction Flow

```
App.jsx
│
├── useCommandData()          → TanStack Query → adapter → SETU / mock
├── useCommandStore()         → Zustand (panel + focus + freshness state)
│
├── [isLoading]  → DashboardSkeleton
├── [isError]    → Error screen + Retry button
│
└── [data ready]
    ├── CommandHeader          Tier 1 — health · alerts · confidence · timestamp
    │                          F15: amber timestamp if lastRefreshed > 2min
    │
    └── <main>
        ├── ExecutiveSummary   KPI bar — 6 metrics
        ├── AlertsZone         click → openPanel('alert', id)
        ├── DeliveryZone       lazy Recharts (ConfidenceTrendChart + PortfolioDonut)
        ├── ProjectHealthGrid  click → openPanel('project', id)
        │                      dblclick → enterFocus(id, sortedIds)
        ├── RiskZone           click → openPanel('risk', id)
        ├── ResourceZone       read-only utilization bars
        ├── DecisionZone       click → openPanel('decision', id)
        ├── TimelineZone       lazy Recharts (MilestoneGantt)
        ├── DependencyZone     click → openPanel('dependency', id)
        └── ActivityFeed       read-only log
        
    ├── DetailPanel            [activePanel != null]
    │   ├── Renders: project | risk | alert | decision | dependency
    │   ├── Focus trap (Tab/Shift+Tab cycles within panel)
    │   ├── Esc → closePanel()
    │   ├── ← back → panelBack()  (history stack)
    │   └── Footer (project only): Raise Escalation · Full Focus View
    │
    └── FocusMode              [focusMode == true]
        ├── Full-screen single-project view
        ├── Prev/Next switcher (severity-sorted)
        └── Esc / F / Exit → exitFocus()
```

Every zone is wrapped in `ZoneErrorBoundary` — a zone crash does not take down the dashboard.

---

## API Flow

```
Browser                    useCommandData          adapter.js              SETU API
   │                            │                      │                      │
   │── page load ──────────────>│                      │                      │
   │                            │── fetchCommandData() │                      │
   │                            │                      │── GET /projects ─────>│
   │                            │                      │<─ [{id,name,...}] ────│
   │                            │                      │                      │
   │                            │                      │── GET /projects/:id/milestones × N ──>│
   │                            │                      │── GET /projects/:id/tasks      × N ──>│
   │                            │                      │<─ (parallel Promise.all) ─────────────│
   │                            │                      │                      │
   │                            │                      │  derive: alerts, risks, resources,
   │                            │                      │  decisions, activity, dependencies,
   │                            │                      │  forecast, summary
   │                            │                      │                      │
   │                            │<── normalized data ──│                      │
   │<── React renders ──────────│                      │                      │
   │                            │                      │                      │
   │                       T+30s│── refetch ───────────>                      │
   │                            │   (background, silent)                      │
   │<── markRefreshed() pulse ──│                      │                      │
```

**Fallback path** (SETU unreachable):
```
adapter.js catch → fetchMockData() → { ...mock, dataSource: 'mock-fallback' }
```
Console warns: `[ECC] SETU API unreachable — using mock fallback: <error message>`  
CommandHeader shows `MOCK` badge (amber) instead of `LIVE` badge (green).

**Retry policy:** TanStack Query — 2 retries, 1s / 2s backoff. `staleTime: 25s`, `refetchInterval: 30s`.

---

## Runtime Screenshots

> Screenshots cannot be embedded in markdown at generation time.  
> To capture: run `npm run dev`, open `http://localhost:5173`.

**What to capture for review:**

| Screen | How to reach |
|---|---|
| Dashboard — default state | Page load (mock data, amber health) |
| Dashboard — LIVE badge | Start SETU API at `127.0.0.1:8000`, set `VITE_USE_MOCK_FALLBACK=false` |
| DashboardSkeleton | Throttle network to Slow 3G in DevTools, reload |
| DetailPanel — project | Click any project card |
| DetailPanel — alert | Click any alert row |
| DetailPanel — back navigation | Click project → click a risk inside → click ← |
| FocusMode | Double-click any project card |
| FocusMode — project switch | Press ArrowRight / ArrowLeft in FocusMode |
| Stale warning | Open DevTools → Application → set `lastRefreshed` to 3 min ago in Zustand devtools |
| Keyboard shortcut overlay | Press `?` |
| Zone error state | Temporarily throw in any zone component, reload |
| Error screen | Set `VITE_USE_MOCK_FALLBACK=false` with no API running |

---

## Failure Scenarios

### F1 — SETU API unreachable on load
- **Trigger:** `VITE_USE_MOCK_FALLBACK=true` (default) + API down
- **Behaviour:** Adapter catches, falls back to `mockData.js`. Dashboard renders normally. CommandHeader shows `MOCK` badge.
- **User impact:** None visible. Data is representative but not live.

### F2 — SETU API unreachable, fallback disabled
- **Trigger:** `VITE_USE_MOCK_FALLBACK=false` + API down
- **Behaviour:** TanStack Query retries 2× (1s, 2s backoff), then sets `isError=true`. App renders full-screen error with Retry button.
- **Recovery:** Click Retry, or wait — TanStack Query will retry on window focus.

### F3 — SETU API returns partial data (one project's milestones fail)
- **Trigger:** `setuApi.milestones(id)` rejects for one project
- **Behaviour:** `adapter.js` uses `.catch(() => [])` per project — partial failure is silently absorbed. That project shows 0% progress and "No milestones".
- **User impact:** Degraded data for one project, rest of dashboard unaffected.

### F4 — Zone component throws a runtime error
- **Trigger:** Any zone component throws during render
- **Behaviour:** `ZoneErrorBoundary` catches it. Shows inline "Failed to load [Zone] / Retry" within that zone's space. Other zones continue rendering.
- **Recovery:** Click Retry in the zone — `setState` resets the boundary.

### F5 — Top-level crash (outside any zone)
- **Trigger:** `App.jsx` or `main.jsx` throws before zones render
- **Behaviour:** `AppErrorBoundary` catches. Full-screen error with `window.location.reload()` button.

### F6 — Stale data (API recovers slowly)
- **Trigger:** Background refetch fails for > 2 minutes
- **Behaviour:** `CommandHeader` timestamp turns amber with `⚠` prefix. Data shown is from last successful fetch. No data loss.
- **Recovery:** Automatic — next successful refetch resets the amber state.

### F7 — Recharts fails to lazy-load
- **Trigger:** Dynamic import of `../charts` fails (network error, chunk 404)
- **Behaviour:** `Suspense` fallback (`ChartSkeleton`) remains visible. Zone renders without chart. No crash.

---

## Integration Notes

### Connecting to SETU PMC API

1. Ensure SETU is running: `http://127.0.0.1:8000/api/v1`
2. Verify: `curl http://127.0.0.1:8000/api/v1/health`
3. Set `.env`:
   ```
   VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
   VITE_USE_MOCK_FALLBACK=true   # keep true — graceful fallback
   ```
4. Run `npm run dev` — CommandHeader will show `LIVE` badge when API responds.

### Replacing mock data with a different API

All field mapping is in `src/services/adapter.js`. Replace `fetchCommandData()` with calls to your API. The normalized shape the dashboard expects:

```js
{
  dataAsOf: ISO string,
  dataSource: 'setu-live' | 'mock-fallback',
  summary: { overallHealth, deliveryConfidence, confidenceTrend,
             activeProjects, criticalRisks, pendingDecisions,
             resourceUtilization, confidenceHistory[] },
  alerts[], projects[], risks[], resources[], milestones[],
  decisions[], activity[], dependencies[],
  escalations[], evidence[], forecast{}
}
```

### CORS
If SETU API is on a different origin, add to `vite.config.js`:
```js
server: { proxy: { '/api': 'http://127.0.0.1:8000' } }
```
And change `VITE_API_BASE_URL=/api/v1`.

---

## Performance Observations

### Build output (production)
| Chunk | Size | Gzip | Notes |
|---|---|---|---|
| `vendor-react` | 285.86 kB | 87.50 kB | React + ReactDOM — parsed once, cached |
| `vendor-query` | 80.37 kB | 26.95 kB | TanStack Query |
| `index` (app) | 131.16 kB | 23.89 kB | All app code |
| `vendor-state` | 4.75 kB | 1.88 kB | Zustand |
| `index` (Recharts) | 421.53 kB | 114.24 kB | **Lazy** — not parsed on initial load |
| CSS | 19.50 kB | 4.80 kB | Tailwind purged |

**Initial parse budget:** ~502 kB raw / ~140 kB gzip. Recharts (421 kB) deferred until first chart renders.

### Runtime
- `React.memo` on `ProjectHealthCard`, `AlertCard`, `RiskCard` — prevents re-render on unrelated state changes
- `useCallback` on all 6 event handlers in `App.jsx` — stable references across renders
- `DashboardSkeleton` matches real layout row-for-row — zero layout shift on data arrival
- TanStack Query `staleTime: 25s` — background refetch does not cause re-render if data unchanged

### Known bottleneck
First render of `DeliveryZone` or `TimelineZone` triggers Recharts dynamic import (~421 kB). On slow connections this shows the `ChartSkeleton` for 1–3 seconds. Acceptable for an internal executive tool on corporate network.

---

## Proof of Execution

### Test suite — 77/77 passing

```
vitest v2.1.9

✓ src/test/interactions.test.jsx   (17 tests)
✓ src/test/detailPanel.test.jsx    (20 tests)
✓ src/test/focusMode.test.jsx      (16 tests)
✓ src/test/keyboard.test.jsx       (10 tests)
✓ src/test/api.test.js             ( 9 tests)
✓ src/test/staleWarning.test.jsx   ( 5 tests)

Test Files  6 passed (6)
Tests       77 passed (77)
Duration    43.15s
```

### Build — exit 0, zero warnings

```
vite v5.4.21 building for production...
✓ 932 modules transformed.
✓ built in 14.61s
```

### Coverage by area

| Area | Tests | What is validated |
|---|---|---|
| API contract | 9 | All required keys, valid severities, forecast totals, fallback path |
| Interactions | 17 | Click/dblclick/Enter/Space on all 5 card types, BLOCKED state, progress bar |
| DetailPanel | 20 | All 5 panel types, close/back/Esc, footer, Related Project link, focus mode entry |
| FocusMode | 16 | Render, content, exit button, prev/next, Esc/f/ArrowLeft/ArrowRight |
| Keyboard/Store | 10 | Shortcut overlay, zone anchors, panel history stack, focusNext/Prev wrap |
| Stale warning | 5 | Fresh/stale states, ⚠ prefix, amber class, clear on refresh |
