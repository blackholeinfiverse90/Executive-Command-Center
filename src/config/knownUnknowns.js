/**
 * BHIV Executive Command Center — Deliverable 12
 * KNOWN UNKNOWNS
 *
 * Every open question that could affect the design, implementation,
 * or operation of the Executive Command Center.
 *
 * Each entry has:
 *   - The unknown question
 *   - Why it matters (impact if unresolved)
 *   - Who can resolve it
 *   - Resolution path
 *   - Priority: CRITICAL / HIGH / MEDIUM / LOW
 *
 * Categories:
 *   U — User & Organizational
 *   D — Data & Integration
 *   T — Technical
 *   S — Scale & Growth
 *   G — Governance & Security
 */

export const KNOWN_UNKNOWNS = [

  // ─── U: USER & ORGANIZATIONAL ─────────────────────────────────────────────

  {
    id: 'U1',
    category: 'User & Organizational',
    priority: 'CRITICAL',
    unknown: 'Who are the exact named executives who will use this dashboard, and what are their specific information needs?',
    whyItMatters: 'The zone layout, KPI selection, and suppression rules were designed for a generic "senior executive." Different executives (CEO vs CTO vs COO) have fundamentally different information priorities. A CEO cares about delivery confidence and decisions. A CTO cares about risks and dependencies. A COO cares about resources and timeline.',
    whoCanResolve: 'BHIV leadership / product owner',
    resolutionPath: 'Conduct 30-minute interviews with each named executive. Ask: "What is the first thing you look for when you open a project status view?" Map answers to zones. Adjust zone ordering and KPI selection per role.',
    currentMitigation: 'Generic executive model used — covers the most common needs. Role-specific views can be added as query parameters (?role=ceo).',
  },
  {
    id: 'U2',
    category: 'User & Organizational',
    priority: 'HIGH',
    unknown: 'How often will executives actually use this dashboard — daily, weekly, or only during incidents?',
    whyItMatters: 'Usage frequency determines the value of features like auto-refresh (30s), data freshness warnings, and keyboard shortcuts. If executives open the dashboard once a week, the 30s refresh is irrelevant. If they have it open all day, it is critical.',
    whoCanResolve: 'BHIV leadership / product owner',
    resolutionPath: 'Add PostHog analytics after launch. Track daily active users, session duration, and return frequency. Adjust refresh interval and feature priority based on real usage data.',
    currentMitigation: 'Designed for daily use with the dashboard open during working hours.',
  },
  {
    id: 'U3',
    category: 'User & Organizational',
    priority: 'HIGH',
    unknown: 'Will executives use the dashboard on a shared screen (meeting room) or individual screens?',
    whyItMatters: 'Shared screen use changes the interaction model entirely. Keyboard shortcuts (1–7, Esc) are not usable on a shared screen. The presenter controls navigation. Font sizes may need to be larger for room visibility.',
    whoCanResolve: 'BHIV leadership',
    resolutionPath: 'Add a "presentation mode" — larger fonts, no keyboard shortcuts, auto-cycling through zones, no interactive panels. Triggered by ?mode=presentation.',
    currentMitigation: 'Designed for individual screen use. Shared screen use is possible but not optimized.',
  },
  {
    id: 'U4',
    category: 'User & Organizational',
    priority: 'MEDIUM',
    unknown: 'What is the escalation path when an executive sees a critical alert — who do they contact and how?',
    whyItMatters: 'The dashboard shows escalations and alerts but provides no action mechanism. If an executive sees "Vendor unresponsive for 48h" and wants to act, they must leave the dashboard to send an email or make a call.',
    whoCanResolve: 'BHIV operations / product owner',
    resolutionPath: 'Add contact information to escalation cards (phone, email, Slack handle). Or add a "Notify" button that triggers a notification to the escalation owner via the BHIV communication system.',
    currentMitigation: 'Dashboard is read-only. Action happens outside the dashboard.',
  },

  // ─── D: DATA & INTEGRATION ────────────────────────────────────────────────

  {
    id: 'D1',
    category: 'Data & Integration',
    priority: 'CRITICAL',
    unknown: 'What are the real data sources for each zone — which systems own project health, risks, alerts, resources, and milestones?',
    whyItMatters: 'The entire dashboard is currently powered by mockData.js. Without knowing the real data sources, the API integration cannot be planned. Different source systems may have different data shapes, authentication requirements, and update frequencies.',
    whoCanResolve: 'BHIV backend / data engineering team',
    resolutionPath: 'Map each data field in mockData.js to its source system. Create a data lineage document. Design the aggregation API (/api/v1/command-summary) that pulls from all sources and returns the unified shape.',
    currentMitigation: 'mockData.js defines the target data shape. Backend must conform to this shape.',
  },
  {
    id: 'D2',
    category: 'Data & Integration',
    priority: 'CRITICAL',
    unknown: 'How is "delivery confidence" calculated — what is the formula and who owns it?',
    whyItMatters: 'Delivery confidence (94%) is the most prominent KPI in the dashboard. If executives do not trust the calculation, they will not trust the dashboard. The formula must be transparent, auditable, and owned by a named person.',
    whoCanResolve: 'BHIV project management / data team',
    resolutionPath: 'Document the formula in a data dictionary. Display the formula in the DetailPanel for the delivery confidence KPI. Add a "How is this calculated?" tooltip.',
    currentMitigation: 'mockData.js returns a hardcoded value. Calculation is undefined.',
  },
  {
    id: 'D3',
    category: 'Data & Integration',
    priority: 'HIGH',
    unknown: 'What is the data update frequency for each zone — how often does project status, risk level, and resource utilization actually change?',
    whyItMatters: 'The 30s polling interval was chosen as a reasonable default. If project status only changes once a day, 30s polling is wasteful. If alerts fire every few seconds, 30s is too slow.',
    whoCanResolve: 'BHIV backend / operations team',
    resolutionPath: 'Measure actual data change frequency in production. Set refetchInterval per query type — alerts every 10s, project status every 5 minutes, resources every 15 minutes.',
    currentMitigation: 'Single 30s interval for all data. Acceptable for Phase 7.',
  },
  {
    id: 'D4',
    category: 'Data & Integration',
    priority: 'HIGH',
    unknown: 'How are historical trends stored — is there a time-series database for confidence history, risk trends, and milestone variance history?',
    whyItMatters: 'The ConfidenceTrendChart shows 7 days of confidence history. The MilestoneGantt shows variance. These require historical data storage, not just current state. If the backend only stores current state, trend charts cannot be built.',
    whoCanResolve: 'BHIV data engineering team',
    resolutionPath: 'Confirm whether a time-series store (InfluxDB, TimescaleDB, or even a simple append-only table) exists. If not, design one as part of the backend integration.',
    currentMitigation: 'mockData.js hardcodes 7 days of confidence history. Real historical data is undefined.',
  },
  {
    id: 'D5',
    category: 'Data & Integration',
    priority: 'MEDIUM',
    unknown: 'What is the data retention policy — how long should activity feed, escalation history, and evidence be stored?',
    whyItMatters: 'The ActivityFeed suppresses items older than 24h (suppression rule). The DetailPanel shows escalations and evidence. If the backend purges data after 7 days, historical evidence for decisions is lost.',
    whoCanResolve: 'BHIV governance / data team',
    resolutionPath: 'Define retention periods per data type. Implement archiving for evidence and escalations. Activity feed can be purged after 30 days.',
    currentMitigation: 'mockData.js has no retention concept. All data is always present.',
  },

  // ─── T: TECHNICAL ─────────────────────────────────────────────────────────

  {
    id: 'T1',
    category: 'Technical',
    priority: 'HIGH',
    unknown: 'What is the target deployment environment — AWS, Azure, GCP, on-premise, or a BHIV private cloud?',
    whyItMatters: 'The deployment recommendation (AWS S3 + CloudFront + GitHub Actions) assumes AWS. If BHIV uses Azure or an on-premise data center, the deployment pipeline is completely different.',
    whoCanResolve: 'BHIV infrastructure / DevOps team',
    resolutionPath: 'Confirm cloud provider. Adjust deployment recommendation accordingly. The application itself is cloud-agnostic — only the hosting and CI/CD pipeline changes.',
    currentMitigation: 'AWS S3 + CloudFront recommended. Adaptable to any static hosting provider.',
  },
  {
    id: 'T2',
    category: 'Technical',
    priority: 'HIGH',
    unknown: 'Will the dashboard be embedded inside a larger BHIV platform (iframe, micro-frontend) or standalone?',
    whyItMatters: 'If embedded in an iframe, the CommandHeader sticky positioning breaks. If embedded as a micro-frontend (Module Federation), the Zustand store and TanStack Query client must be shared or isolated. The current architecture assumes standalone.',
    whoCanResolve: 'BHIV platform architecture team',
    resolutionPath: 'If iframe: remove sticky header, pass height to parent. If micro-frontend: configure Module Federation in vite.config.js, expose the App component as a remote.',
    currentMitigation: 'Designed as a standalone SPA. Embedding requires architectural changes.',
  },
  {
    id: 'T3',
    category: 'Technical',
    priority: 'MEDIUM',
    unknown: 'What is the BHIV browser policy — which browsers and versions are supported on executive devices?',
    whyItMatters: 'The dashboard uses CSS Grid, ResizeObserver, and EventSource. These require Chrome 80+, Firefox 79+, Safari 14+. If BHIV has older browser requirements, polyfills are needed.',
    whoCanResolve: 'BHIV IT / device management team',
    resolutionPath: 'Get the browser matrix from BHIV IT. Add browserslist to package.json. Run postcss autoprefixer. Test in the specific versions.',
    currentMitigation: 'Assumes modern browsers. No polyfills currently configured.',
  },
  {
    id: 'T4',
    category: 'Technical',
    priority: 'MEDIUM',
    unknown: 'Is there an existing BHIV design system or component library that this dashboard should conform to?',
    whyItMatters: 'The Phase 6 design system was built from scratch (dark theme, Inter font, custom color tokens). If BHIV has an existing design system (brand colors, fonts, component library), the dashboard may need to be reskinned.',
    whoCanResolve: 'BHIV design / brand team',
    resolutionPath: 'If BHIV has a design system: replace tailwind.config.js tokens with BHIV brand tokens. The component structure remains the same — only the visual layer changes.',
    currentMitigation: 'Custom design system built. Adaptable via tailwind.config.js token replacement.',
  },

  // ─── S: SCALE & GROWTH ────────────────────────────────────────────────────

  {
    id: 'S1',
    category: 'Scale & Growth',
    priority: 'HIGH',
    unknown: 'How many projects, risks, alerts, and milestones will the production system have?',
    whyItMatters: 'The dashboard was designed and tested with 6 projects, 4 risks, 4 alerts, 5 milestones. No virtualization was implemented. At 50+ projects, the ProjectHealthGrid becomes unscrollable.',
    whoCanResolve: 'BHIV project management / product owner',
    resolutionPath: 'Get production data volume estimates. If > 20 projects: add @tanstack/react-virtual. If > 10 alerts: add "show top N" with "view all" link. See SCALABILITY_ROADMAP.',
    currentMitigation: 'Designed for small-to-medium portfolio (6–20 projects). Virtualization not yet implemented.',
  },
  {
    id: 'S2',
    category: 'Scale & Growth',
    priority: 'MEDIUM',
    unknown: 'Will BHIV need multiple dashboard types (Executive, Team, Project, Regional) in the future?',
    whyItMatters: 'The current architecture is a single-page app with no routing. If BHIV needs a Team Health Dashboard or a Regional Operations Dashboard, React Router must be added and the zone system must be generalized.',
    whoCanResolve: 'BHIV product / engineering leadership',
    resolutionPath: 'Add React Router before building a second dashboard type. Define a DashboardShell component that accepts a zone configuration array. Each dashboard type is a different zone configuration.',
    currentMitigation: 'Single dashboard. Router not yet added.',
  },
  {
    id: 'S3',
    category: 'Scale & Growth',
    priority: 'LOW',
    unknown: 'Will this dashboard capability be shared with other BHIV teams or external stakeholders?',
    whyItMatters: 'If the dashboard is shared externally (board members, government stakeholders), the data shown must be filtered by role and the authentication model must support external users.',
    whoCanResolve: 'BHIV leadership / security team',
    resolutionPath: 'Add role-based data filtering at the API level. The frontend receives only the data the user is authorized to see — no frontend filtering of sensitive data.',
    currentMitigation: 'Designed for internal executive use only. No role-based filtering implemented.',
  },

  // ─── G: GOVERNANCE & SECURITY ─────────────────────────────────────────────

  {
    id: 'G1',
    category: 'Governance & Security',
    priority: 'CRITICAL',
    unknown: 'What is the data classification of the information shown on the dashboard — is it confidential, restricted, or public?',
    whyItMatters: 'The dashboard shows project names, risk details, resource utilization, vendor names, and escalation details. If this is classified information, the dashboard must not be accessible without authentication, must not be cached by CDN, and must not appear in browser history.',
    whoCanResolve: 'BHIV security / compliance team',
    resolutionPath: 'Classify each data field. Add authentication before any data is shown. Configure CloudFront with no-cache headers for the API responses. Add Content-Security-Policy headers.',
    currentMitigation: 'No authentication implemented (out of scope per task brief). Assumes authentication is handled by the surrounding platform.',
  },
  {
    id: 'G2',
    category: 'Governance & Security',
    priority: 'HIGH',
    unknown: 'Are there audit logging requirements — must executive interactions (panel opens, focus mode) be logged?',
    whyItMatters: 'In regulated industries, who viewed what data and when must be logged. If BHIV operates in a regulated environment, every DetailPanel open and FocusMode entry may need to be logged.',
    whoCanResolve: 'BHIV compliance / legal team',
    resolutionPath: 'Add an audit event emitter to openPanel() and enterFocus() in commandStore.js. Send events to a backend audit log endpoint. Events: { userId, action, entityType, entityId, timestamp }.',
    currentMitigation: 'No audit logging implemented.',
  },
  {
    id: 'G3',
    category: 'Governance & Security',
    priority: 'MEDIUM',
    unknown: 'What are the data residency requirements — must the dashboard data stay within a specific geographic region?',
    whyItMatters: 'If BHIV operates under GDPR, DPDP (India), or other data residency laws, the API and CDN must be configured to keep data within the required region.',
    whoCanResolve: 'BHIV legal / compliance team',
    resolutionPath: 'Configure CloudFront with a geographic restriction. Deploy the API in the required AWS region. Ensure no data is cached in CDN edge nodes outside the permitted region.',
    currentMitigation: 'No data residency configuration. Assumes no geographic restriction.',
  },
]

// ─── KNOWN UNKNOWNS SUMMARY ───────────────────────────────────────────────────

export const KNOWN_UNKNOWNS_SUMMARY = {
  total: 18,
  byPriority: {
    CRITICAL: 4,  // U1, D1, D2, G1
    HIGH:     8,  // U2, U3, D3, D4, T1, T2, S1, G2
    MEDIUM:   5,  // U4, D5, T3, T4, S2, G3 — wait, let me count: U4, D5, T3, T4, G3 = 5
    LOW:      1,  // S3
  },
  byCategory: {
    'User & Organizational':    4,
    'Data & Integration':       5,
    'Technical':                4,
    'Scale & Growth':           3,
    'Governance & Security':    3,
  },
  mustResolveBeforeProduction: [
    'U1 — Identify named executives and their specific information needs',
    'D1 — Map all data fields to real source systems',
    'D2 — Define and document the delivery confidence formula',
    'G1 — Classify dashboard data and confirm authentication requirements',
    'T1 — Confirm deployment environment (AWS vs Azure vs on-premise)',
  ],
  mustResolveBeforeScale: [
    'D3 — Measure real data change frequency per zone',
    'D4 — Confirm time-series storage for trend data',
    'S1 — Get production data volume estimates',
    'T2 — Confirm standalone vs embedded deployment model',
  ],
}
