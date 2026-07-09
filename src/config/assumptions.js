/**
 * BHIV Executive Command Center — Deliverable 11
 * ASSUMPTIONS
 *
 * Every assumption made during design and implementation.
 * Each entry has: the assumption, the rationale, the risk if wrong,
 * and the resolution path if the assumption is invalidated.
 *
 * Categories:
 *   A — User & Audience
 *   B — Data & API
 *   C — Environment & Infrastructure
 *   D — Design & UX
 *   E — Technology
 *   F — Scope & Boundary
 */

export const ASSUMPTIONS = [

  // ─── A: USER & AUDIENCE ───────────────────────────────────────────────────

  {
    id: 'A1',
    category: 'User & Audience',
    assumption: 'The primary user is a senior executive (C-suite or VP level) who scans, not reads.',
    rationale: 'The task brief explicitly states "senior leadership" and "within 3–5 seconds." This drove every design decision — pre-attentive color signals, severity sorting, suppression of detail until requested.',
    riskIfWrong: 'If the primary user is a project manager or analyst, the information density is too low and the suppression rules are too aggressive. They would need more detail in Tier 2.',
    resolutionPath: 'Add a "role" query parameter (?role=pm) that relaxes suppression rules and shows more detail in Tier 2 zones without changing the executive view.',
  },
  {
    id: 'A2',
    category: 'User & Audience',
    assumption: 'Executives use the dashboard on a desktop or laptop at 1280px+ width.',
    rationale: 'Command center dashboards are designed for large screens. The 12-column grid and multi-zone layout require at least 1280px to be useful. Mobile was explicitly deprioritized.',
    riskIfWrong: 'If executives frequently access the dashboard on tablets or phones (e.g. during travel), the responsive collapse to single-column loses the Z-pattern reading advantage.',
    resolutionPath: 'Build a dedicated mobile summary view — CommandHeader + top 3 alerts + project health grid only. Full dashboard remains desktop-only.',
  },
  {
    id: 'A3',
    category: 'User & Audience',
    assumption: 'Executives do not need to input data — the dashboard is read-only.',
    rationale: 'The task brief defines the boundary as "Executive Information Architecture" — not workflow management. No create/edit/delete actions were designed.',
    riskIfWrong: 'If executives need to acknowledge alerts, approve decisions, or add comments from the dashboard, the interaction model needs mutation flows (useMutation, optimistic updates, conflict resolution).',
    resolutionPath: 'Add action buttons to DetailPanel (L2) — "Acknowledge", "Approve", "Escalate". Wire to POST endpoints. See BACKEND_DIRECTION.apiDesign.futureEndpoints.',
  },
  {
    id: 'A4',
    category: 'User & Audience',
    assumption: 'Executives are comfortable with keyboard shortcuts (1–7, Esc, F, ←→, ?).',
    rationale: 'Senior leaders in technology organizations typically use keyboard-heavy workflows. Shortcuts were designed as efficiency accelerators, not primary navigation.',
    riskIfWrong: 'If executives are not keyboard users, the shortcut overlay (?) is never opened and zone jumps are never used. The dashboard still works — mouse navigation is fully supported.',
    resolutionPath: 'No change needed — shortcuts are additive. Mouse navigation is the primary path.',
  },
  {
    id: 'A5',
    category: 'User & Audience',
    assumption: 'Multiple executives may view the dashboard simultaneously but independently.',
    rationale: 'No real-time collaboration features (shared cursors, live annotations) were designed. Each executive has their own panel/focus state.',
    riskIfWrong: 'If executives need to co-view the dashboard in a meeting room (shared screen), the panel state is per-browser-session and does not sync.',
    resolutionPath: 'Add URL-based state encoding — panel type/id in query params so a URL can be shared to open the same view.',
  },

  // ─── B: DATA & API ────────────────────────────────────────────────────────

  {
    id: 'B1',
    category: 'Data & API',
    assumption: 'A single API endpoint returns all dashboard data in one response.',
    rationale: 'useCommandData.js uses a single queryKey: ["commandData"] and a single fetchCommandData() call. This minimizes network round-trips and simplifies the loading state.',
    riskIfWrong: 'If data comes from 5 different microservices (projects API, risks API, alerts API, etc.), the single-fetch model breaks. Each zone would need its own query.',
    resolutionPath: 'Split useCommandData.js into per-zone hooks (useProjectsData, useRisksData, etc.). Each zone handles its own loading state. TanStack Query parallel queries handle this cleanly.',
  },
  {
    id: 'B2',
    category: 'Data & API',
    assumption: 'The API response shape matches the mockData.js object exactly.',
    rationale: 'The data contract was designed in mockData.js first. The API must conform to this shape — not the other way around. This is the "API contract" principle.',
    riskIfWrong: 'If the real API returns differently named fields (e.g. "project_name" instead of "name"), every component that reads data.projects[].name will break silently.',
    resolutionPath: 'Add a Zod schema that validates the API response shape on every fetch. Shape mismatches throw immediately with a clear error message.',
  },
  {
    id: 'B3',
    category: 'Data & API',
    assumption: '30-second polling is sufficient data freshness for executive decision-making.',
    rationale: 'Portfolio health metrics (project status, risk levels, resource utilization) change on the order of hours, not seconds. 30s polling is more than sufficient.',
    riskIfWrong: 'If BHIV connects a live incident management system where alerts fire every few seconds, 30s polling means a critical alert is invisible for up to 30s.',
    resolutionPath: 'Implement SSE (Server-Sent Events) for the alerts channel only. Keep polling for the rest. See REAL_TIME_DIRECTION.',
  },
  {
    id: 'B4',
    category: 'Data & API',
    assumption: 'The dashboard displays at most 20 projects, 10 risks, 10 alerts, and 10 milestones.',
    rationale: 'The current mockData has 6 projects, 4 risks, 4 alerts, 5 milestones. The UI was designed for this scale. No virtualization was implemented.',
    riskIfWrong: 'If BHIV has 50+ projects, the ProjectHealthGrid becomes unscrollable and the sort helpers become slow.',
    resolutionPath: 'Add @tanstack/react-virtual for the project grid. Add pagination or "show top N" filtering for all zone lists.',
  },
  {
    id: 'B5',
    category: 'Data & API',
    assumption: 'All data is pre-aggregated by the backend — the frontend does no business logic calculations.',
    rationale: 'The dashboard receives deliveryConfidence: 94, not raw sprint data to calculate confidence from. Business logic belongs in the backend.',
    riskIfWrong: 'If the backend sends raw data and expects the frontend to calculate KPIs, the frontend becomes a calculation layer — violating the boundary defined in the task brief.',
    resolutionPath: 'Push all calculations to the backend. The frontend only formats and displays pre-computed values.',
  },

  // ─── C: ENVIRONMENT & INFRASTRUCTURE ─────────────────────────────────────

  {
    id: 'C1',
    category: 'Environment & Infrastructure',
    assumption: 'The dashboard is accessed on a corporate network with reliable connectivity.',
    rationale: 'No offline capability was built. The loading state shows "Loading command data…" with no cached fallback.',
    riskIfWrong: 'If executives access the dashboard from poor network conditions (travel, remote offices), the 30s polling may fail frequently and the stale warning will appear often.',
    resolutionPath: 'Add vite-plugin-pwa with a stale-while-revalidate service worker. Last successful data is served from cache while a new fetch is attempted.',
  },
  {
    id: 'C2',
    category: 'Environment & Infrastructure',
    assumption: 'The dashboard runs in a modern browser (Chrome 100+, Firefox 100+, Safari 15+).',
    rationale: 'CSS Grid, CSS custom properties, ResizeObserver, and EventSource are all used. These require modern browser support.',
    riskIfWrong: 'If BHIV executives use Internet Explorer or very old corporate browsers, the dashboard will not render correctly.',
    resolutionPath: 'Add browserslist config to package.json. Run postcss autoprefixer. Test in the specific browser versions used by BHIV.',
  },
  {
    id: 'C3',
    category: 'Environment & Infrastructure',
    assumption: 'Authentication is handled outside this boundary — the dashboard receives an authenticated session.',
    rationale: 'The task brief explicitly excludes authentication from this boundary. The dashboard assumes the user is already authenticated.',
    riskIfWrong: 'If the dashboard is deployed without authentication, any user on the corporate network can see executive-level project data.',
    resolutionPath: 'Add an auth wrapper in main.jsx that checks for a valid session token before rendering App.jsx. Redirect to the BHIV identity provider if not authenticated.',
  },

  // ─── D: DESIGN & UX ───────────────────────────────────────────────────────

  {
    id: 'D1',
    category: 'Design & UX',
    assumption: 'Dark theme is the correct choice for an executive command center.',
    rationale: 'Command centers (SOC, NOC, Bloomberg Terminal) universally use dark themes. Dark reduces eye strain in low-light environments and makes status colors (red/amber/green) more vivid and pre-attentive.',
    riskIfWrong: 'If BHIV executives use the dashboard in bright office environments or prefer light themes, the dark theme may reduce readability.',
    resolutionPath: 'Add CSS custom properties for all 4 surface colors and 4 status colors. A light theme is a single CSS variable swap — no component changes needed.',
  },
  {
    id: 'D2',
    category: 'Design & UX',
    assumption: 'Red/amber/green is universally understood as critical/warning/healthy.',
    rationale: 'Traffic light semantics are universal in operational dashboards. No alternative color system was considered.',
    riskIfWrong: 'Approximately 8% of males have red-green color blindness. The current design uses color as the primary status signal.',
    resolutionPath: 'Add a secondary signal to every status indicator — shape (●/▲/■) or text label alongside color. StatusDot already has aria-label — add a visible text fallback option.',
  },
  {
    id: 'D3',
    category: 'Design & UX',
    assumption: 'The Z-pattern reading order (critical top-left, log bottom-right) matches how BHIV executives scan.',
    rationale: 'Z-pattern is the established reading pattern for dashboard interfaces. It is used by Bloomberg Terminal, Datadog, and Grafana.',
    riskIfWrong: 'If BHIV executives have a different mental model (e.g. they always look at projects first, not alerts), the zone ordering creates friction.',
    resolutionPath: 'Add zone reordering capability — executives can drag zones to their preferred positions. Store order in localStorage.',
  },
  {
    id: 'D4',
    category: 'Design & UX',
    assumption: 'Double-click for Focus Mode is a discoverable interaction.',
    rationale: 'Double-click is a standard desktop interaction for "open in full view." The keyboard shortcut overlay (?) documents it.',
    riskIfWrong: 'If executives do not discover double-click, Focus Mode is never used. The dashboard still works — it is an enhancement, not a requirement.',
    resolutionPath: 'Add a tooltip on ProjectHealthCard hover: "Double-click for full project view." Or add an explicit "Focus" button on each card.',
  },

  // ─── E: TECHNOLOGY ────────────────────────────────────────────────────────

  {
    id: 'E1',
    category: 'Technology',
    assumption: 'The 901 KB JS bundle is acceptable for an internal corporate tool.',
    rationale: 'Internal tools on corporate networks (100 Mbps+) load 901 KB in under 100ms. The bundle size warning is noted but not a blocker.',
    riskIfWrong: 'If executives access the dashboard on slow connections or the bundle grows significantly, initial load time degrades.',
    resolutionPath: 'Code split Recharts behind dynamic import(). See BUILD_TOOLING.immediateAction.',
  },
  {
    id: 'E2',
    category: 'Technology',
    assumption: 'JavaScript (no TypeScript) is sufficient for the current team and codebase size.',
    rationale: 'TypeScript adds value at scale. At Phase 7 with one team and living config files as the type contract, the overhead is not yet justified.',
    riskIfWrong: 'As the codebase grows and more developers contribute, prop type errors and data shape mismatches become harder to catch without TypeScript.',
    resolutionPath: 'Migrate to TypeScript before the codebase exceeds 50 components or a second team joins. See DECISION_LOG entry for TypeScript.',
  },
  {
    id: 'E3',
    category: 'Technology',
    assumption: 'Recharts is sufficient for all current and near-future visualization needs.',
    rationale: 'The 9 visualization types in visualizationStrategy.js are all achievable with Recharts. The dependency graph (Tier 3 future) is the only exception.',
    riskIfWrong: 'If BHIV needs highly custom charts (drag-and-drop Gantt, real-time streaming, force-directed graphs), Recharts hits its customization ceiling.',
    resolutionPath: 'Add @xyflow/react for dependency graphs. Add uPlot for real-time streaming. Keep Recharts for standard charts.',
  },

  // ─── F: SCOPE & BOUNDARY ──────────────────────────────────────────────────

  {
    id: 'F1',
    category: 'Scope & Boundary',
    assumption: 'This dashboard is one bounded capability within a larger BHIV/SETU platform.',
    rationale: 'The task brief explicitly states: "You are building one bounded capability within a much larger sovereign engineering ecosystem." Adjacent systems (auth, backend, AI agents) are out of scope.',
    riskIfWrong: 'If this dashboard is expected to be the entire platform, the scope is severely underbuilt.',
    resolutionPath: 'Clarify platform architecture with the BHIV engineering lead. This dashboard is the executive experience layer only.',
  },
  {
    id: 'F2',
    category: 'Scope & Boundary',
    assumption: 'The 6 projects in mockData.js represent the real portfolio structure.',
    rationale: 'mockData.js was designed to be representative, not exhaustive. The data shapes (project, risk, alert, etc.) are the contract — the values are placeholders.',
    riskIfWrong: 'If real projects have additional fields (budget, phase, geography, team size), the component catalogue and data shapes need to be extended.',
    resolutionPath: 'Extend mockData.js shapes to include new fields. Update componentCatalogue.js with new props. Components only render what they receive — additive changes are safe.',
  },
  {
    id: 'F3',
    category: 'Scope & Boundary',
    assumption: 'This specification is implementation-independent — it can be rebuilt in any framework.',
    rationale: 'The config files (informationHierarchy, componentCatalogue, uxPrinciples, visualizationStrategy, designSystem, technologyDirection) are framework-agnostic specifications. The React implementation is one realization of the spec.',
    riskIfWrong: 'If BHIV decides to rebuild in Vue, Angular, or a native app, the React-specific implementation details (hooks, JSX, Zustand) do not transfer.',
    resolutionPath: 'The config files are the portable specification. The React implementation is the reference implementation. Any rebuild starts from the config files, not the components.',
  },
]

// ─── ASSUMPTIONS SUMMARY ──────────────────────────────────────────────────────

export const ASSUMPTIONS_SUMMARY = {
  total: 18,
  byCategory: {
    'User & Audience':              5,
    'Data & API':                   5,
    'Environment & Infrastructure': 3,
    'Design & UX':                  4,
    'Technology':                   3,
    'Scope & Boundary':             3,
  },
  highestRisk: [
    'B2 — API response shape mismatch (silent breakage)',
    'D2 — Color blindness (8% of male users)',
    'A3 — Read-only assumption (executives may need to act)',
    'B1 — Single endpoint assumption (may be multiple microservices)',
  ],
  immediateValidations: [
    'Confirm API response shape with backend team before connecting real data',
    'Confirm executive browser versions with BHIV IT',
    'Confirm whether executives need to acknowledge/approve from the dashboard',
    'Confirm maximum project/risk/alert counts in production data',
  ],
}
