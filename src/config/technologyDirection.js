/**
 * BHIV Executive Command Center — Phase 7
 * TECHNOLOGY DIRECTION
 *
 * This file is the technology recommendation record for BHIV dashboards.
 * It documents every technology decision: what we use, why, what the
 * trade-offs are, and what to adopt next as the system scales.
 *
 * Sections:
 *   1. CURRENT_STACK         — what is already in place and why it was chosen
 *   2. FRONTEND_FRAMEWORK    — React 18 assessment + alternatives
 *   3. BUILD_TOOLING         — Vite assessment + alternatives
 *   4. STATE_MANAGEMENT      — Zustand assessment + alternatives
 *   5. DATA_FETCHING         — TanStack Query assessment + alternatives
 *   6. STYLING               — Tailwind CSS assessment + alternatives
 *   7. VISUALIZATION         — Recharts assessment + alternatives
 *   8. BACKEND_DIRECTION     — API layer recommendations (not yet built)
 *   9. REAL_TIME_DIRECTION   — WebSocket / SSE recommendations
 *  10. TESTING_DIRECTION     — Testing stack recommendations
 *  11. OBSERVABILITY         — Monitoring and error tracking
 *  12. DEPLOYMENT            — Hosting and CI/CD recommendations
 *  13. SCALABILITY_ROADMAP   — How the stack evolves as BHIV grows
 *  14. DECISION_LOG          — Why alternatives were rejected
 */

// ─── 1. CURRENT STACK ─────────────────────────────────────────────────────────
// What is running today. Every entry is justified — nothing is here by default.

export const CURRENT_STACK = {
    runtime:       { technology: 'React 18.2',           role: 'UI rendering and component model' },
    build:         { technology: 'Vite 5.2',             role: 'Dev server, bundler, HMR' },
    styling:       { technology: 'Tailwind CSS 3.4',     role: 'Design tokens, utility classes' },
    state:         { technology: 'Zustand 4.5',          role: 'Panel state, focus mode, refresh pulse' },
    dataFetching:  { technology: 'TanStack Query 5.28',  role: 'Data fetching, caching, auto-refresh' },
    visualization: { technology: 'Recharts 2.10',        role: 'Trend charts, Gantt, portfolio donut' },
    utilities:     { technology: 'clsx 2.1',             role: 'Conditional class composition' },
    language:      { technology: 'JavaScript (JSX)',     role: 'Application language — no TypeScript yet' },
    packageMgr:    { technology: 'npm',                  role: 'Dependency management' },
  
    // Current bundle size (Phase 5 build output)
    bundleSize: {
      js:          '901 KB minified (247 KB gzip)',
      css:         '17.73 KB minified (4.36 KB gzip)',
      modules:     927,
      largestContributor: 'Recharts (~400 KB of the JS bundle)',
      note: 'Chunk splitting not yet configured — single bundle. Acceptable for internal tool.',
    },
  }
  
  // ─── 2. FRONTEND FRAMEWORK ────────────────────────────────────────────────────
  
  export const FRONTEND_FRAMEWORK = {
    current: 'React 18.2',
  
    advantages: [
      'Concurrent rendering — React 18 Suspense boundaries allow zones to load independently without blocking the header',
      'Largest ecosystem in frontend — every library we need (Recharts, TanStack Query, Zustand) has first-class React support',
      'Component model maps directly to the zone/card/primitive hierarchy defined in componentCatalogue.js',
      'React DevTools makes Zustand store inspection and re-render profiling straightforward',
      'Stable, 10-year-old API — no risk of breaking changes disrupting the dashboard',
      'useEffect + useCallback patterns are well understood by any React developer BHIV hires',
    ],
  
    tradeoffs: [
      'No built-in routing — if BHIV adds multiple dashboard views (portfolio, project, team), a router must be added',
      'JSX requires a build step — cannot be dropped into a plain HTML page',
      'React 18 Concurrent Mode adds complexity if Suspense boundaries are misused',
      'Bundle size: React + ReactDOM = ~130 KB gzip — unavoidable baseline cost',
    ],
  
    maintainability: [
      'Component catalogue (componentCatalogue.js) makes every component discoverable and contractual',
      'Zone/card/primitive hierarchy means new developers can locate any UI element in under 60 seconds',
      'Functional components + hooks only — no class components, no legacy patterns',
      'clsx for conditional classes keeps JSX readable — no string concatenation',
    ],
  
    scalability: [
      'React scales to hundreds of components without architectural changes',
      'If BHIV adds 5 more dashboard types, each is a new set of zones — no framework change needed',
      'React.memo and useMemo available for expensive re-renders if the project list grows beyond 50 projects',
      'React Server Components (RSC) available in Next.js if server-side rendering becomes a requirement',
    ],
  
    performance: [
      'isAnimationActive=false on all Recharts components — prevents re-animation on every 30s refresh',
      'TanStack Query staleTime=25s prevents redundant re-renders between refreshes',
      'Zustand subscriptions are granular — components only re-render when their slice of state changes',
      'No unnecessary useEffect chains — data flows from TanStack Query → Zustand → components in one direction',
    ],
  
    futureExtensibility: [
      'Migrate to Next.js if BHIV needs SSR, file-based routing, or API routes in the same repo',
      'React Native Web if a tablet/mobile view is ever required — same components, different renderer',
      'React Server Components for data-heavy zones if API response times become a concern',
    ],
  
    recommendation: 'KEEP. React 18 is the correct choice for this scale and team profile. No migration needed.',
  }
  
  // ─── 3. BUILD TOOLING ─────────────────────────────────────────────────────────
  
  export const BUILD_TOOLING = {
    current: 'Vite 5.2 + @vitejs/plugin-react',
  
    advantages: [
      'Cold start in <500ms — developer opens the project and sees the dashboard immediately',
      'HMR (Hot Module Replacement) updates individual components without full page reload — critical for iterating on zone layouts',
      'Native ES modules in dev — no bundling during development, only in production',
      'Rollup-based production build produces optimized output with tree-shaking',
      'Zero configuration for React + Tailwind — postcss.config.js and vite.config.js are both minimal',
      'First-class TypeScript support when BHIV is ready to migrate',
    ],
  
    tradeoffs: [
      'Single 901 KB JS chunk — Rollup manualChunks not yet configured. Acceptable now, must be addressed before production',
      'CJS deprecation warning in current build output — postcss.config.js needs "type": "module" in package.json',
      'No built-in SSR — if Next.js is adopted, Vite is replaced entirely',
      'Plugin ecosystem smaller than webpack — edge cases may require custom Rollup plugins',
    ],
  
    maintainability: [
      'vite.config.js is 5 lines — any developer can understand the build in 30 seconds',
      'No webpack.config.js complexity — loaders, resolvers, and plugins are not needed at this scale',
      'Vite errors are descriptive — missing imports and circular dependencies are caught immediately',
    ],
  
    scalability: [
      'Vite handles projects with 1000+ modules without configuration changes',
      'Code splitting via dynamic import() is straightforward — DetailPanel and FocusMode are candidates',
      'Build time scales linearly — 927 modules builds in ~11s, 2000 modules would build in ~20s',
    ],
  
    performance: [
      'Production build with gzip: 247 KB JS + 4.36 KB CSS — acceptable for an internal dashboard on a corporate network',
      'Recharts is the dominant bundle contributor (~400 KB) — code splitting it behind a dynamic import would halve initial load',
      'Tailwind CSS purges unused classes at build time — CSS is already minimal at 17.73 KB',
    ],
  
    immediateAction: {
      priority: 'HIGH',
      action: 'Add "type": "module" to package.json to resolve CJS deprecation warning',
      action2: 'Configure build.rollupOptions.output.manualChunks to split Recharts into a separate chunk',
      impact: 'Reduces initial JS parse time — Recharts loads only when a chart zone is rendered',
    },
  
    futureExtensibility: [
      'Vite 6 (current) adds Environment API — enables SSR and edge rendering without switching to Next.js',
      'Vitest (same config as Vite) is the natural test runner when BHIV adds unit tests',
      'vite-plugin-pwa adds offline capability if the dashboard needs to work without network',
    ],
  
    recommendation: 'KEEP. Fix the two immediate actions above. Add manualChunks before production deployment.',
  }
  
  // ─── 4. STATE MANAGEMENT ──────────────────────────────────────────────────────
  
  export const STATE_MANAGEMENT = {
    current: 'Zustand 4.5',
  
    whatItManages: [
      'Panel history stack — which L2 DetailPanel is open and the back-navigation history',
      'Focus mode — which project is in L3 FocusMode and the severity-sorted project list',
      'Refresh pulse — 600ms green border animation triggered on every data refresh',
      'Keyboard shortcut overlay — show/hide state',
    ],
  
    advantages: [
      'Zero boilerplate — the entire store is 60 lines vs 200+ lines for equivalent Redux',
      'No Provider wrapper required — components subscribe directly via useCommandStore(selector)',
      'Granular subscriptions — a component that only needs activePanel does not re-render when focusMode changes',
      'Devtools support via zustand/middleware — store state is inspectable in Redux DevTools',
      'Immer middleware available if state mutations become complex',
      'TypeScript support is first-class when BHIV migrates',
    ],
  
    tradeoffs: [
      'No time-travel debugging out of the box (Redux has this) — not needed at current scale',
      'No built-in persistence — if BHIV needs to remember the last open panel across page refreshes, middleware must be added',
      'Single store pattern — if multiple teams own different parts of the dashboard, store ownership becomes unclear',
      'Less opinionated than Redux — requires discipline to keep actions and state shapes documented',
    ],
  
    maintainability: [
      'commandStore.js is the single file for all UI state — any developer can find any state in one place',
      'Each action is a named function with a clear purpose — openPanel, closePanel, enterFocus, exitFocus',
      'Panel history stack pattern (push/pop) is a well-understood data structure — no custom logic to learn',
      'Store is co-located with its consumers — no separate actions/, reducers/, selectors/ directories',
    ],
  
    scalability: [
      'If BHIV adds a second dashboard (e.g. Team Dashboard), create a second store — do not expand commandStore.js',
      'Zustand supports slices pattern for splitting a large store into logical modules',
      'For cross-dashboard state (e.g. user preferences, theme), a separate globalStore.js is the right pattern',
      'Zustand handles 10,000+ subscribers without performance degradation',
    ],
  
    performance: [
      'Selector-based subscriptions mean only the component that needs activePanel re-renders when a panel opens',
      'markRefreshed() uses setTimeout to clear the pulse flag — no polling, no interval leaks',
      'focusNext/focusPrev use array index arithmetic — O(1) operations, no list traversal',
    ],
  
    futureExtensibility: [
      'zustand/middleware persist — save last panel state to localStorage for session continuity',
      'zustand/middleware devtools — already available, enable in development builds',
      'If state complexity grows significantly, Jotai (atomic model) is the natural next step — same philosophy, finer granularity',
    ],
  
    recommendation: 'KEEP. Zustand is correctly scoped to UI state only. Data state belongs in TanStack Query.',
  }
  
  // ─── 5. DATA FETCHING ─────────────────────────────────────────────────────────
  
  export const DATA_FETCHING = {
    current: 'TanStack Query 5.28 (React Query)',
  
    whatItManages: [
      'Fetching command data from mockData.js (future: real API)',
      'Auto-refresh every 30 seconds (refetchInterval: 30_000)',
      'Cache management — staleTime: 25_000 prevents redundant fetches',
      'Success callback — fires markRefreshed() to trigger the CommandHeader pulse',
    ],
  
    advantages: [
      'Declarative data fetching — useCommandData() is 20 lines and handles loading, error, success, and refresh',
      'Background refetch — data updates without the user seeing a loading state',
      'staleTime and refetchInterval are independently configurable — fine-grained freshness control',
      'Automatic retry on network failure — executive never sees a failed dashboard without a retry attempt',
      'Query invalidation — when a real API is connected, specific queries can be invalidated on mutation',
      'DevTools available — query state, cache, and refetch timing are all inspectable',
    ],
  
    tradeoffs: [
      'Overkill for a single query — if the dashboard only ever has one data endpoint, TanStack Query adds ~13 KB gzip for features not used',
      'v5 API changed significantly from v4 — any existing BHIV code using v4 patterns will need migration',
      'No built-in WebSocket support — real-time push requires a separate integration (see REAL_TIME_DIRECTION)',
      'Cache invalidation strategy must be designed when mutations are added (e.g. acknowledging an alert)',
    ],
  
    maintainability: [
      'useCommandData.js is the single data entry point — replacing mockData.js with a real API is a one-line change',
      'queryKey: ["commandData"] is the cache key — adding per-project queries follows the same pattern',
      'Error and loading states are handled in App.jsx — zones never need to handle their own loading states',
      'TanStack Query v5 is stable and actively maintained — no migration risk in the 2-year horizon',
    ],
  
    scalability: [
      'When BHIV adds per-project detail APIs, each gets its own useQuery with queryKey: ["project", id]',
      'Parallel queries — multiple zones can fetch independent data sources simultaneously',
      'Infinite queries available for paginated activity feeds when the log grows beyond 24h',
      'Optimistic updates available when executives can acknowledge alerts or approve decisions from the dashboard',
    ],
  
    performance: [
      'staleTime: 25_000 means data is considered fresh for 25s — no redundant fetches between the 30s intervals',
      'Background refetch does not trigger a loading spinner — executive sees no visual disruption',
      'Query deduplication — if two components call useCommandData() simultaneously, only one network request is made',
      'select option available to transform/filter data at the query level — reduces component re-renders',
    ],
  
    futureExtensibility: [
      'Replace fetchCommandData in mockData.js with a real fetch() call — zero other changes required',
      'Add useMutation for alert acknowledgement, decision approval, risk status updates',
      'Add useInfiniteQuery for ActivityFeed when historical data pagination is needed',
      'Integrate with WebSocket via queryClient.setQueryData() for real-time push updates',
    ],
  
    recommendation: 'KEEP. The abstraction in useCommandData.js means the real API connection is a single-file change.',
  }
  
  // ─── 6. STYLING ───────────────────────────────────────────────────────────────
  
  export const STYLING = {
    current: 'Tailwind CSS 3.4 + custom design tokens in tailwind.config.js',
  
    advantages: [
      'Design tokens in tailwind.config.js are the single source of truth — changing surface-dark changes it everywhere',
      'Utility-first means no CSS file grows unboundedly — globals.css is 120 lines for the entire application',
      'PurgeCSS built-in — production CSS is 17.73 KB because unused utilities are removed at build time',
      'No naming conventions to enforce — no BEM, no SMACSS, no CSS Modules naming debates',
      'Responsive prefixes (lg:col-span-8) keep responsive rules co-located with the element they affect',
      'clsx integration makes conditional classes readable — no string template literals',
    ],
  
    tradeoffs: [
      'Long className strings — ProjectHealthCard has 8+ classes on one element. Acceptable with clsx, but unfamiliar to CSS-first developers',
      'No CSS-in-JS runtime — dynamic styles based on JavaScript variables require inline style or CSS custom properties',
      'Tailwind 4 (alpha) changes the config format significantly — upgrade will require config migration',
      'Design token changes require a rebuild — no runtime theming without CSS custom properties',
    ],
  
    maintainability: [
      'designSystem.js documents every token with its purpose — no undocumented magic values',
      'globals.css utility classes (.zone-label, .badge, .type-body) abstract repeated patterns into named classes',
      'Forbidden patterns list in COMPONENT_CONSISTENCY prevents hard-coded hex values from entering the codebase',
      'Any developer who knows Tailwind can read and modify any component without learning a custom CSS architecture',
    ],
  
    scalability: [
      'Adding a second BHIV dashboard reuses the same tailwind.config.js tokens — visual consistency is automatic',
      'CSS custom properties (var(--color-surface-dark)) can be added alongside Tailwind tokens for runtime theming',
      'Tailwind plugins can extend the system with dashboard-specific utilities without modifying core config',
      'Component library extraction (e.g. @bhiv/ui package) is straightforward — components are self-contained',
    ],
  
    performance: [
      'Production CSS: 17.73 KB minified, 4.36 KB gzip — negligible load time on any network',
      'No runtime CSS-in-JS computation — all styles are static strings resolved at build time',
      'No style recalculation on re-render — Tailwind classes are stable strings, not computed objects',
    ],
  
    futureExtensibility: [
      'CSS custom properties for runtime theming — add a light mode or BHIV brand theme without a rebuild',
      'Tailwind CSS 4 migration when stable — new config format, faster build, native CSS cascade layers',
      'Extract shared tokens into a @bhiv/design-tokens package for use across multiple dashboards',
      'shadcn/ui components are Tailwind-native — drop-in accessible primitives (Dialog, Tooltip, Select) when needed',
    ],
  
    recommendation: 'KEEP. Add CSS custom properties for the 4 status colors to enable runtime theming when BHIV needs it.',
  }
  
  // ─── 7. VISUALIZATION ─────────────────────────────────────────────────────────
  
  export const VISUALIZATION = {
    current: 'Recharts 2.10',
  
    currentUsage: [
      'ConfidenceTrendChart — AreaChart, 7-day confidence history, gradient fill',
      'MilestoneGantt — horizontal BarChart, stacked base+variance bars, Cell color by threshold',
      'PortfolioDonut — RadialBarChart, 3 arcs for on-track/at-risk/blocked',
    ],
  
    advantages: [
      'React-native — components, not imperative D3 selections. Charts are JSX, not canvas draw calls',
      'Recharts components accept React children — adding a ReferenceLine or custom tooltip is one JSX element',
      'Responsive containers built-in — ResponsiveContainer handles resize without custom ResizeObserver code',
      'SVG output — charts are accessible, zoomable, and print correctly',
      'isAnimationActive=false prevents re-animation on every 30s data refresh — critical for dashboards',
      'Sufficient for all 9 visualization types in visualizationStrategy.js at current scale',
    ],
  
    tradeoffs: [
      'Bundle size: ~400 KB of the 901 KB JS bundle — the single largest contributor',
      'Limited chart types — no native force-directed graph for the dependency visualization (Tier 3 future)',
      'Customization ceiling — highly custom charts (e.g. custom Gantt with drag handles) require D3 escape hatches',
      'Recharts 3 (alpha) is a full rewrite — migration will be required eventually',
      'No built-in data virtualization — rendering 500+ data points in a chart will degrade performance',
    ],
  
    maintainability: [
      'All 3 chart components are in charts/index.jsx — one file to find all visualization code',
      'visualizationStrategy.js documents the justification for every chart type — no undocumented chart decisions',
      'Chart props are minimal — ConfidenceTrendChart takes data[] and trend string, nothing else',
      'isAnimationActive=false is enforced at the component level — callers cannot accidentally enable animation',
    ],
  
    scalability: [
      'Code split Recharts behind a dynamic import — charts load only when a chart zone scrolls into view',
      'For the dependency graph (Tier 3 future): use @xyflow/react (React Flow) — purpose-built for node-link diagrams',
      'For high-frequency real-time data (>1 update/second): replace Recharts with uPlot — 10x faster canvas rendering',
      'For complex custom charts: D3 for the math, React for the rendering — Recharts is not needed',
    ],
  
    performance: [
      'Current: single bundle — Recharts loads even on pages with no charts',
      'Fix: dynamic import() for charts/index.jsx reduces initial parse by ~400 KB',
      'SVG rendering is GPU-accelerated in modern browsers — no performance concern at current data volumes',
      'ResponsiveContainer uses ResizeObserver internally — no layout thrashing on window resize',
    ],
  
    futureExtensibility: [
      '@xyflow/react — for the dependency graph and stakeholder map (Tier 3, Phase 8+)',
      'uPlot — for real-time streaming charts if BHIV connects a live data feed',
      'Observable Plot — for statistical analysis charts if BHIV adds a data science layer',
      'Nivo — alternative to Recharts with more chart types and better TypeScript support',
    ],
  
    immediateAction: {
      priority: 'MEDIUM',
      action: 'Code split charts/index.jsx with dynamic import() — reduces initial bundle by ~400 KB',
      impact: 'Dashboard header and project grid load instantly; charts load 200–400ms later',
    },
  
    recommendation: 'KEEP for current scope. Code split immediately. Evaluate @xyflow/react when dependency graph is built.',
  }
  
  // ─── 8. BACKEND DIRECTION ─────────────────────────────────────────────────────
  // The current backend is mockData.js. This section defines what replaces it.
  
  export const BACKEND_DIRECTION = {
    currentState: 'mockData.js — synchronous mock returning a static object',
    replacementPoint: 'src/services/mockData.js — one file, one function: fetchCommandData()',
  
    recommended: {
      technology: 'REST API (existing BHIV systems) or GraphQL (if data is relational)',
      rationale: [
        'fetchCommandData() already has the correct signature — async function returning a data object',
        'TanStack Query handles caching, retry, and background refresh — the API layer only needs to return data',
        'REST is simpler to connect: replace the mock return with fetch("https://api.bhiv.internal/command-summary")',
        'GraphQL is justified only if the dashboard needs to query different field sets per panel type',
      ],
    },
  
    apiDesign: {
      primaryEndpoint: 'GET /api/v1/command-summary — returns the full data object matching current mockData shape',
      rationale: 'Single endpoint matches the single-query pattern in useCommandData.js — no refactoring needed',
      futureEndpoints: [
        'GET /api/v1/projects/:id — for DetailPanel project drill-down (currently uses filtered mock data)',
        'GET /api/v1/risks/:id — for DetailPanel risk drill-down',
        'POST /api/v1/alerts/:id/acknowledge — for alert acknowledgement action',
        'POST /api/v1/decisions/:id/approve — for decision approval action',
      ],
    },
  
    authentication: {
      recommended: 'OAuth 2.0 / OIDC with the existing BHIV identity provider',
      implementation: 'Add Authorization header to fetchCommandData() — one line change',
      sessionManagement: 'Token refresh handled by a thin auth wrapper around fetch — not in TanStack Query',
    },
  
    dataContract: {
      rule: 'API response shape must match the mockData.js object exactly — no frontend changes on API connection',
      validation: 'Add Zod schema validation on the API response to catch shape mismatches early',
      versioning: 'Version the API (/v1/) from day one — dashboard can pin to v1 while v2 is developed',
    },
  
    recommendation: 'Connect REST first. Add GraphQL only if per-panel field selection becomes a performance concern.',
  }
  
  // ─── 9. REAL-TIME DIRECTION ───────────────────────────────────────────────────
  // Current: polling every 30s. This section defines the path to real-time push.
  
  export const REAL_TIME_DIRECTION = {
    current: {
      mechanism: 'TanStack Query refetchInterval: 30_000',
      assessment: 'Correct for the current phase. Polling is simple, reliable, and requires no server infrastructure.',
      limitation: 'A critical alert raised at T+1s is not visible until T+30s. Acceptable for portfolio health, not for incident response.',
    },
  
    whenToUpgrade: [
      'BHIV connects a live incident management system (PagerDuty, OpsGenie)',
      'Executives need sub-10s alert visibility',
      'The dashboard is used during live incidents where status changes every few seconds',
    ],
  
    recommended: {
      technology: 'Server-Sent Events (SSE)',
      rationale: [
        'SSE is unidirectional (server → client) — correct for a read-only dashboard',
        'SSE works over HTTP/1.1 — no WebSocket upgrade handshake, no proxy configuration',
        'SSE reconnects automatically on disconnect — no client-side reconnection logic needed',
        'SSE integrates with TanStack Query via queryClient.setQueryData() — no new state management needed',
        'SSE is supported in all modern browsers natively via EventSource API',
      ],
      implementation: 'EventSource("/api/v1/command-stream") → on message → queryClient.setQueryData(["commandData"], newData)',
    },
  
    alternativeWebSocket: {
      technology: 'WebSocket',
      useWhen: 'BHIV adds bidirectional features — executive acknowledges alerts, approves decisions from the dashboard',
      library: 'Native WebSocket API or socket.io-client if the server uses socket.io',
      tradeoff: 'More complex than SSE — requires connection management, heartbeat, and reconnection logic',
    },
  
    recommendation: 'Keep polling for Phase 7. Implement SSE when BHIV connects a live alert source.',
  }
  
  // ─── 10. TESTING DIRECTION ────────────────────────────────────────────────────
  // No tests exist today. This section defines the testing stack to adopt.
  
  export const TESTING_DIRECTION = {
    currentState: 'No tests. mockData.js provides a stable data contract for manual testing.',
  
    recommended: {
      unitAndComponent: {
        technology: 'Vitest + React Testing Library',
        rationale: [
          'Vitest uses the same config as Vite — zero additional build configuration',
          'React Testing Library tests behavior, not implementation — tests survive refactors',
          'Co-located test files (cards/index.test.jsx) keep tests close to the code they test',
          'Vitest is 5–10x faster than Jest for Vite projects — fast feedback loop',
        ],
        priorityTargets: [
          'bySeverity, byDeadline, byVariance, byUtilization sort helpers — pure functions, easy to test',
          'StatusDot — aria-label correctness for accessibility',
          'ProjectHealthCard — BLOCKED state rendering, click/doubleClick handlers',
          'commandStore.js — openPanel/closePanel/panelBack stack behavior',
          'useCommandData.js — refetch interval, markRefreshed() trigger',
        ],
      },
  
      endToEnd: {
        technology: 'Playwright',
        rationale: [
          'Playwright tests the full dashboard in a real browser — catches layout and interaction bugs',
          'Playwright supports Chromium, Firefox, and WebKit — covers all executive browser profiles',
          'Playwright component testing available for isolated component tests without a full server',
          'Playwright trace viewer records every test step — debugging failures is visual, not log-based',
        ],
        priorityScenarios: [
          'Click ProjectHealthCard → DetailPanel opens with correct project data',
          'Double-click ProjectHealthCard → FocusMode opens, Esc exits',
          'Press 1–7 → page scrolls to correct zone',
          'Data refreshes every 30s → CommandHeader pulse fires',
          'Press ? → shortcut overlay appears',
        ],
      },
  
      accessibility: {
        technology: 'axe-core via @axe-core/playwright',
        rationale: 'Automated WCAG 2.1 AA checks on every Playwright test run — catches contrast and ARIA violations',
      },
    },
  
    recommendation: 'Add Vitest for sort helpers and store logic first — highest ROI, lowest setup cost.',
  }
  
  // ─── 11. OBSERVABILITY ────────────────────────────────────────────────────────
  // How BHIV knows the dashboard is working correctly in production.
  
  export const OBSERVABILITY = {
    currentState: 'No observability. Errors are visible only in the browser console.',
  
    recommended: {
      errorTracking: {
        technology: 'Sentry',
        rationale: [
          'React Error Boundaries + Sentry captures component crashes with full stack trace and component tree',
          'Sentry captures TanStack Query fetch failures — BHIV knows when the API is down before executives notice',
          'Session replay shows exactly what the executive saw before an error — no reproduction steps needed',
          'Sentry performance monitoring tracks dashboard load time and API response times',
        ],
        implementation: 'Sentry.init() in main.jsx + ErrorBoundary wrapper around each zone in App.jsx',
      },
  
      analytics: {
        technology: 'PostHog (self-hosted) or Mixpanel',
        rationale: [
          'Track which zones executives interact with most — informs future zone prioritization',
          'Track DetailPanel open rates per panel type — identifies which entities need more Tier 3 detail',
          'Track FocusMode usage — if rarely used, reconsider the double-click interaction cost',
          'Self-hosted PostHog keeps executive behavior data within BHIV infrastructure',
        ],
      },
  
      performanceMonitoring: {
        technology: 'Web Vitals via web-vitals npm package',
        metrics: ['LCP (Largest Contentful Paint) — dashboard visible time', 'FID (First Input Delay) — time to first interaction', 'CLS (Cumulative Layout Shift) — zone layout stability on load'],
        target: 'LCP < 2.5s on corporate network, FID < 100ms, CLS < 0.1',
      },
    },
  
    recommendation: 'Add Sentry before production deployment. Add analytics after 30 days of usage data.',
  }
  
  // ─── 12. DEPLOYMENT ───────────────────────────────────────────────────────────
  
  export const DEPLOYMENT = {
    currentState: 'npm run build produces a dist/ folder. No deployment pipeline.',
  
    recommended: {
      hosting: {
        primary: 'AWS S3 + CloudFront',
        rationale: [
          'Static site — no server required. S3 hosts the dist/ folder, CloudFront serves it globally',
          'CloudFront edge caching means the dashboard loads in <500ms from any BHIV office location',
          'S3 + CloudFront is the lowest-cost hosting option for a static internal tool — no EC2, no containers',
          'CloudFront supports custom domains and HTTPS certificates via ACM — zero additional cost',
          'S3 versioning enables instant rollback — deploy new build, revert in 30 seconds if broken',
        ],
        alternative: 'AWS Amplify Hosting — wraps S3 + CloudFront with a CI/CD pipeline and branch previews',
      },

      cicd: {
        technology: 'GitHub Actions',
        pipeline: [
          'Push to main → npm ci → npm run build → aws s3 sync dist/ s3://bhiv-dashboard → CloudFront invalidation',
          'Pull request → npm ci → npm run build → deploy to preview URL (Amplify branch deploy)',
          'On failure → Sentry release tracking marks the bad deploy — correlates errors to the exact commit',
        ],
        rationale: [
          'GitHub Actions is free for public repos and cheap for private — no separate CI infrastructure',
          'aws s3 sync is idempotent — only changed files are uploaded, not the full dist/ on every deploy',
          'CloudFront invalidation (/* ) clears the CDN cache after every deploy — executives always get the latest build',
        ],
      },

      environments: {
        development: 'localhost:5173 — Vite dev server with HMR',
        staging:     's3://bhiv-dashboard-staging — deployed on every PR merge to develop branch',
        production:  's3://bhiv-dashboard — deployed on every merge to main, manual approval gate',
      },
    },

    recommendation: 'AWS S3 + CloudFront + GitHub Actions. Total infrastructure cost: ~$5/month for an internal tool.',
  }

  // ─── 13. SCALABILITY ROADMAP ──────────────────────────────────────────────────
  // How the stack evolves as BHIV grows. Ordered by trigger condition, not timeline.

  export const SCALABILITY_ROADMAP = {
    phase: 'Current — Phase 7',
    stack: 'React + Vite + Zustand + TanStack Query + Recharts + Tailwind',
    supports: 'Single dashboard, 1 data source, 6 projects, 1 team',

    triggers: [
      {
        trigger: 'BHIV adds a second dashboard type (e.g. Team Health Dashboard)',
        action: 'Add React Router — file-based routing with /executive, /team, /project routes',
        technology: 'React Router v6 or TanStack Router',
        effort: 'LOW — routing is additive, no existing code changes',
      },
      {
        trigger: 'Project list grows beyond 20 projects',
        action: 'Add React.memo to ProjectHealthCard, virtualize the grid with @tanstack/react-virtual',
        technology: '@tanstack/react-virtual',
        effort: 'LOW — drop-in virtualization, no architecture change',
      },
      {
        trigger: 'Multiple teams contribute to the dashboard codebase',
        action: 'Extract @bhiv/ui component library — shared cards, zones, and design tokens as an npm package',
        technology: 'Vite library mode + npm private registry or GitHub Packages',
        effort: 'MEDIUM — requires package extraction and versioning discipline',
      },
      {
        trigger: 'BHIV connects a live alert source (PagerDuty, OpsGenie)',
        action: 'Replace polling with SSE — EventSource on /api/v1/command-stream',
        technology: 'Native EventSource API + queryClient.setQueryData()',
        effort: 'LOW — frontend change is 10 lines, server change is the main work',
      },
      {
        trigger: 'Dashboard needs to work offline or on poor corporate network',
        action: 'Add service worker with stale-while-revalidate caching strategy',
        technology: 'vite-plugin-pwa (Workbox)',
        effort: 'LOW — plugin handles service worker generation automatically',
      },
      {
        trigger: 'BHIV adds TypeScript to the codebase',
        action: 'Rename .jsx → .tsx, add tsconfig.json, add types to all props contracts',
        technology: 'TypeScript 5 — Vite and Tailwind already support it natively',
        effort: 'MEDIUM — mechanical rename + type annotation work, no logic changes',
        priority: 'Recommended before the codebase exceeds 50 components',
      },
      {
        trigger: 'Executives need to act from the dashboard (acknowledge alerts, approve decisions)',
        action: 'Add useMutation in TanStack Query + optimistic updates + WebSocket for confirmation',
        technology: 'TanStack Query mutations + WebSocket or SSE',
        effort: 'MEDIUM — requires API endpoints and conflict resolution strategy',
      },
      {
        trigger: 'BHIV needs the dependency graph visualization (Tier 3, Phase 8+)',
        action: 'Add @xyflow/react for node-link diagrams in DetailPanel',
        technology: '@xyflow/react (React Flow)',
        effort: 'LOW — additive, only used in Tier 3 DetailPanel',
      },
      {
        trigger: 'Dashboard load time exceeds 3s on corporate network',
        action: 'Code split Recharts + DetailPanel + FocusMode behind dynamic import()',
        technology: 'Vite manualChunks + React.lazy + Suspense',
        effort: 'LOW — configuration change + 3 lazy() wrappers',
      },
      {
        trigger: 'BHIV needs server-side rendering for SEO or initial load performance',
        action: 'Migrate from Vite to Next.js App Router',
        technology: 'Next.js 14+ with App Router',
        effort: 'HIGH — full migration, justified only if SSR is a hard requirement',
        note: 'Not recommended for an internal executive dashboard — SSR adds complexity without benefit',
      },
    ],

    neverDo: [
      'Do not add Redux — Zustand handles current and projected state complexity',
      'Do not add a CSS-in-JS runtime (styled-components, Emotion) — Tailwind is already the styling system',
      'Do not add a component framework (MUI, Ant Design) — the design system is custom and must stay that way',
      'Do not add a monorepo tool (Nx, Turborepo) until there are at least 3 separate packages to manage',
      'Do not migrate to a different charting library unless Recharts becomes a hard blocker',
    ],
  }

  // ─── 14. DECISION LOG ─────────────────────────────────────────────────────────
  // Why alternatives were considered and rejected. Prevents re-litigating past decisions.

  export const DECISION_LOG = [
    {
      decision: 'React over Vue or Svelte',
      chosen: 'React 18',
      alternatives: ['Vue 3', 'Svelte 5', 'SolidJS'],
      reason: 'Recharts, TanStack Query, and Zustand all have first-class React support. Vue and Svelte equivalents exist but are less mature. BHIV hiring pool is React-dominant.',
      date: 'Phase 1',
    },
    {
      decision: 'Vite over Create React App or webpack',
      chosen: 'Vite 5',
      alternatives: ['Create React App (deprecated)', 'webpack 5', 'Parcel'],
      reason: 'CRA is deprecated. webpack config complexity is unjustified for this project size. Vite cold start is 10x faster than webpack for development.',
      date: 'Phase 1',
    },
    {
      decision: 'Zustand over Redux Toolkit or Context API',
      chosen: 'Zustand 4',
      alternatives: ['Redux Toolkit', 'React Context + useReducer', 'Jotai', 'Recoil'],
      reason: 'Redux Toolkit is 3x more boilerplate for the same result. Context API causes full subtree re-renders on every state change — unacceptable for a dashboard with 15+ components. Zustand subscriptions are granular.',
      date: 'Phase 2',
    },
    {
      decision: 'TanStack Query over SWR or manual fetch',
      chosen: 'TanStack Query 5',
      alternatives: ['SWR', 'Apollo Client', 'manual fetch + useEffect'],
      reason: 'SWR is simpler but has less control over refetch intervals and cache invalidation. Apollo requires GraphQL. Manual fetch + useEffect creates loading/error state boilerplate in every component.',
      date: 'Phase 2',
    },
    {
      decision: 'Tailwind CSS over CSS Modules or styled-components',
      chosen: 'Tailwind CSS 3',
      alternatives: ['CSS Modules', 'styled-components', 'Emotion', 'vanilla CSS'],
      reason: 'CSS Modules require naming conventions and separate files. styled-components adds a runtime CSS-in-JS cost. Tailwind design tokens in tailwind.config.js are the design system — changing one token changes the entire dashboard.',
      date: 'Phase 1',
    },
    {
      decision: 'Recharts over D3, Victory, or Nivo',
      chosen: 'Recharts 2',
      alternatives: ['D3.js', 'Victory', 'Nivo', 'Chart.js', 'ECharts'],
      reason: 'D3 is imperative — requires manual DOM manipulation inside React, fighting the rendering model. Victory has a smaller community. Nivo is heavier. Recharts is declarative JSX, well-maintained, and sufficient for the 3 chart types needed.',
      date: 'Phase 5',
    },
    {
      decision: 'JavaScript over TypeScript',
      chosen: 'JavaScript (JSX)',
      alternatives: ['TypeScript'],
      reason: 'TypeScript adds value at scale (50+ components, multiple contributors). At Phase 7 with one team and living config files as the type contract, the overhead is not yet justified. Migrate when the team grows or the codebase exceeds 50 components.',
      date: 'Phase 1',
      revisit: 'Recommended before production handoff to a second team',
    },
    {
      decision: 'Polling over WebSocket for data refresh',
      chosen: 'TanStack Query refetchInterval: 30_000',
      alternatives: ['WebSocket', 'Server-Sent Events', 'GraphQL subscriptions'],
      reason: 'Portfolio health data changes on the order of minutes, not seconds. Polling every 30s is sufficient and requires zero server infrastructure. WebSocket adds connection management complexity with no benefit at current data velocity.',
      date: 'Phase 2',
      revisit: 'Revisit when BHIV connects a live incident management system',
    },
    {
      decision: 'Single-page app over Next.js',
      chosen: 'Vite SPA',
      alternatives: ['Next.js App Router', 'Remix'],
      reason: 'The dashboard is an internal tool accessed by authenticated executives on a corporate network. SEO is irrelevant. SSR adds deployment complexity (Node.js server) with no user-facing benefit. SPA with CDN hosting is simpler and cheaper.',
      date: 'Phase 1',
    },
  ]

  // ─── TECHNOLOGY DIRECTION EXPORT ──────────────────────────────────────────────

  export const TECHNOLOGY_DIRECTION = {
    CURRENT_STACK,
    FRONTEND_FRAMEWORK,
    BUILD_TOOLING,
    STATE_MANAGEMENT,
    DATA_FETCHING,
    STYLING,
    VISUALIZATION,
    BACKEND_DIRECTION,
    REAL_TIME_DIRECTION,
    TESTING_DIRECTION,
    OBSERVABILITY,
    DEPLOYMENT,
    SCALABILITY_ROADMAP,
    DECISION_LOG,

    VERSION: '1.0.0',
    PROJECT: 'BHIV Executive Command Center',
    phase: 'Phase 7 — Technology Direction',
  }
