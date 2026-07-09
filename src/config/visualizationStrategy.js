/**
 * PHASE 5 — VISUALIZATION STRATEGY
 * ─────────────────────────────────────────────────────────────────────────────
 * This file defines WHERE each visualization type is used, WHY, and what
 * data it requires. Every recommendation is justified against the cognitive
 * model from Phase 1.
 *
 * Core principle: A visualization earns its place only if it communicates
 * faster than the text or number it replaces.
 * If a number is clearer than a chart, use the number.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── 1. KPIs ─────────────────────────────────────────────────────────────────
export const KPI_STRATEGY = {
  type: 'KPI (Key Performance Indicator)',
  component: 'MetricCard',
  usedIn: ['ExecutiveSummary (Tier 1)', 'FocusMode KPI strip (Tier 3)'],
  justification: `
    KPIs are the fastest information format for executives.
    A single large number with a trend arrow answers "how are we doing?"
    in under 500ms. No chart can match that speed for a single metric.
    Used for: Delivery Confidence, Active Projects, Critical Risks,
    Pending Decisions, Resource Utilization.
  `,
  rules: [
    'Value must be a single number — never a range or average without context',
    'Always pair with trend arrow — direction matters more than absolute value',
    'Always pair with delta — "+2%" tells more than "94%"',
    'Maximum 5 KPIs in Tier 1 — cognitive working memory limit',
    'Label must be ≤ 3 words — executives scan, not read',
  ],
  notUsedFor: [
    'Metrics that require comparison across multiple entities (use bar chart)',
    'Metrics that require time context (use trend line)',
    'Metrics with multiple dimensions (use heatmap)',
  ],
}

// ─── 2. TREND ANALYSIS ───────────────────────────────────────────────────────
export const TREND_STRATEGY = {
  type: 'Trend Analysis (Area/Line Chart)',
  component: 'ConfidenceTrendChart',
  library: 'Recharts — AreaChart',
  usedIn: ['DeliveryZone (Tier 2)', 'FocusMode (Tier 3)'],
  justification: `
    A single confidence number (94%) tells the executive the current state.
    It does NOT tell them whether 94% is improving or collapsing.
    A 7-day area chart answers: "Is this getting better or worse?"
    The trend shape (rising, flat, falling) is readable in <1 second.
    An executive who sees a falling trend at 94% acts differently than
    one who sees a rising trend at 94%.
    Trend is the most important context for any KPI.
  `,
  dataRequired: {
    field: 'summary.confidenceHistory',
    shape: '[{ day: "Mon", value: 91 }, ...]',
    points: '7 — one per day, current week',
  },
  rules: [
    'Area fill, not line only — area communicates volume/weight of confidence',
    'Color matches status: green area if trending up, amber if flat, red if falling',
    'No axis labels — the shape is the message, not the numbers',
    'Minimal grid lines — one horizontal reference at 80% threshold',
    'Last point highlighted — shows current value clearly',
    'No tooltips in Tier 2 — tooltips require hover, executives scan',
  ],
  notUsedFor: [
    'Comparing trends across multiple projects simultaneously (use small multiples)',
    'Data with fewer than 3 points (use KPI with delta instead)',
  ],
}

// ─── 3. STATUS INDICATORS ────────────────────────────────────────────────────
export const STATUS_INDICATOR_STRATEGY = {
  type: 'Status Indicators (Dots, Badges, Border Accents)',
  components: ['StatusDot', 'ZoneShell badge', 'ProjectHealthCard border-l-4'],
  usedIn: ['All zones — Tier 1, 2, and 3'],
  justification: `
    Color is the fastest pre-attentive attribute humans process — under 50ms.
    Status dots and colored borders communicate health before any text is read.
    The left border on ProjectHealthCard means an executive scanning 6 cards
    sees the red/amber cluster in <200ms without reading a single name.
    Status indicators are the primary navigation tool for executive attention.
  `,
  semantics: {
    green:  'healthy | on-track | resolved | available',
    amber:  'at-risk | slipping | needs attention | warning',
    red:    'critical | blocked | overdue | overloaded | failed',
    blue:   'informational | neutral | in-progress | pending',
  },
  rules: [
    'Color is semantic — never decorative',
    'Every status must have a text fallback (aria-label) for accessibility',
    'Dot size: sm (8px) for inline, lg (12px) for card headers',
    'Border accent (4px left) for cards — thicker than dot, more scannable in grids',
    'Badge on ZoneShell — count of problems, not health status',
  ],
  notUsedFor: [
    'More than 3 status levels in a single context — cognitive overload',
    'Decorative color — every color must map to colorSemantics',
  ],
}

// ─── 4. PROGRESS INDICATORS ──────────────────────────────────────────────────
export const PROGRESS_STRATEGY = {
  type: 'Progress Indicators (Horizontal Bars)',
  components: ['ProjectHealthCard progress bar', 'ResourceBar', 'DeliveryZone split bar'],
  usedIn: ['ProjectHealthGrid (Tier 2)', 'ResourceZone (Tier 2)', 'DeliveryZone (Tier 2)'],
  justification: `
    Progress bars communicate completion percentage as a spatial relationship.
    The human visual system reads bar length faster than it reads a number.
    "78% complete" requires reading. A bar that is 3/4 full is understood
    in under 200ms. Combined with status color, a progress bar communicates
    both completion AND health simultaneously — two dimensions in one element.
    The DeliveryZone split bar (green|amber|red) shows portfolio distribution
    as a single scannable element — 3 numbers replaced by one visual.
  `,
  rules: [
    'Bar color must match project/resource status — not a fixed color',
    'Bar height: 6px for card context, 8px for zone context',
    'Never show percentage text AND bar — choose one. Bar in Tier 2, number in Tier 3',
    'Split bar segments must be proportional — no minimum segment width',
    'Overload bars (>100%) cap at 100% visual width — show ⚠ text instead',
  ],
  notUsedFor: [
    'Comparing progress across many projects simultaneously (use bar chart)',
    'Non-linear progress (use status indicator instead)',
  ],
}

// ─── 5. TIMELINE / GANTT ─────────────────────────────────────────────────────
export const TIMELINE_STRATEGY = {
  type: 'Timeline / Gantt (Horizontal Bar Chart)',
  component: 'MilestoneGantt',
  library: 'Recharts — BarChart (horizontal)',
  usedIn: ['TimelineZone (Tier 2)', 'FocusMode (Tier 3)'],
  justification: `
    Time relationships are inherently spatial. A table of dates forces the
    executive to mentally compute "Jan 25 vs Jan 28 = 3 days slip."
    A horizontal bar chart makes that slip visible as a physical gap.
    The executive sees which milestones are slipping and by how much
    without any arithmetic. Variance is encoded as bar extension beyond
    the planned date marker — the further right, the worse the slip.
    This is how Bloomberg Terminal and Datadog display time-series data:
    spatial encoding, not tabular encoding.
  `,
  dataRequired: {
    field: 'milestones',
    shape: '{ project, name, planned, forecast, variance, status }',
    encoding: 'planned date = bar start, variance = bar extension color',
  },
  rules: [
    'Planned date shown as a vertical reference line — not a bar segment',
    'Variance extension colored by threshold: 0=green, 1-7=amber, >7=red',
    'Sort by variance descending — most slipped always at top',
    'Project name on Y axis, time on X axis',
    'No tooltips in Tier 2 — shape communicates, numbers are Tier 3',
    'Blocked milestones shown with red fill + hatching pattern',
  ],
  notUsedFor: [
    'More than 10 milestones in Tier 2 — use table with scroll instead',
    'Real-time data — Gantt is for planned vs actual, not live status',
  ],
}

// ─── 6. HEATMAP ──────────────────────────────────────────────────────────────
export const HEATMAP_STRATEGY = {
  type: 'Heatmap (Color-encoded Grid)',
  component: 'ResourceHeatBar (enhanced ResourceBar)',
  usedIn: ['ResourceZone (Tier 2)'],
  justification: `
    A heatmap encodes a single dimension (utilization %) as color intensity.
    For resource utilization, the executive needs to answer:
    "Which teams are in danger?" not "What is the exact percentage?"
    Color intensity (light green → dark amber → red) communicates
    danger level faster than reading "94%" vs "101%".
    The ResourceBar already uses color thresholds — this formalizes
    that as a heatmap principle: the bar IS the heatmap cell.
    For future: a full resource heatmap (teams × weeks) would show
    utilization patterns over time — currently out of scope.
  `,
  dataRequired: {
    field: 'resources',
    thresholds: '< 70% = green, 70-85% = light amber, 85-100% = amber, >100% = red',
  },
  rules: [
    'Color intensity must increase with utilization — not binary',
    'Overload (>100%) must be visually distinct from high (85-100%)',
    'Team name on left, bar in center, exact % on right',
    'Overload warning icon (⚠) supplements color — two channels',
  ],
  notUsedFor: [
    'Tier 1 — heatmaps require scanning, not pre-attentive reading',
    'Single-value metrics — use KPI instead',
  ],
}

// ─── 7. DEPENDENCY VISUALIZATION ─────────────────────────────────────────────
export const DEPENDENCY_STRATEGY = {
  type: 'Dependency Visualization (Directed List / Future: Graph)',
  component: 'DependencyCard (Tier 2), future: DependencyGraph (Tier 3)',
  usedIn: ['DependencyZone (Tier 2)', 'DetailPanel (Tier 3 — future)'],
  justification: `
    Cross-project dependencies are directional relationships.
    In Tier 2, a directed text list (A BLOCKED BY B) is sufficient —
    the executive needs to know WHAT is blocked, not the full graph topology.
    In Tier 3 (DetailPanel), a node-link diagram would show the full
    dependency chain: which projects cascade if one is unblocked.
    A relationship graph is only justified when the executive needs to
    understand propagation — not just the immediate blocker.
    Current implementation: directed list (Tier 2).
    Future: force-directed graph using Recharts or D3 (Tier 3 only).
  `,
  tier2: {
    format: 'Directed text list with severity dot and type label',
    justification: 'Fast to scan, no rendering overhead, sufficient for "what is blocked"',
  },
  tier3Future: {
    format: 'Node-link graph — projects as nodes, dependencies as directed edges',
    justification: 'Shows cascade risk — if Kiran unblocks, what else unblocks?',
    library: 'D3 force-directed or Recharts custom — not yet implemented',
  },
  rules: [
    'Direction must always be explicit: FROM blocked BY TO',
    'Severity color on the relationship, not the node',
    'Never show a graph in Tier 2 — too much cognitive load for scanning',
    'Graph only in Tier 3 when executive has chosen to investigate',
  ],
  notUsedFor: [
    'Tier 1 or Tier 2 — relationship graphs require investigation mode',
    'More than 20 nodes — graph becomes unreadable, use filtered list',
  ],
}

// ─── 8. RELATIONSHIP GRAPHS ──────────────────────────────────────────────────
export const RELATIONSHIP_GRAPH_STRATEGY = {
  type: 'Relationship Graphs (Future — Tier 3 only)',
  usedIn: ['DetailPanel (Tier 3) — future implementation'],
  justification: `
    Relationship graphs (org charts, dependency maps, stakeholder maps)
    are high-cognitive-load visualizations. They require the executive
    to trace paths, not scan values. This is appropriate ONLY in Tier 3
    when the executive has deliberately chosen to investigate a specific
    entity. Never in Tier 1 or Tier 2.
    Current scope: not implemented. Defined here for future phases.
  `,
  futureUseCases: [
    'Project dependency cascade map (which projects unblock if X is resolved)',
    'Stakeholder influence map (who needs to approve what)',
    'Risk propagation graph (which risks affect which projects)',
  ],
  rules: [
    'Only in Tier 3 — never in ambient or scan layers',
    'Must have a "focus node" — the entity the executive clicked on',
    'Maximum depth: 2 hops from focus node — deeper = noise',
    'Color nodes by status — same semantics as StatusDot',
  ],
}

// ─── 9. MAPS ─────────────────────────────────────────────────────────────────
export const MAP_STRATEGY = {
  type: 'Geographic Maps',
  usedIn: 'Not applicable to current scope',
  justification: `
    Geographic maps are appropriate when the data has a spatial dimension —
    e.g., project locations, team distribution across offices, deployment regions.
    The current BHIV Command Center manages project portfolio health, not
    geographic operations. No data in the current schema has a location dimension.
    Maps are explicitly excluded from this implementation.
    If future data includes regional deployment, office locations, or
    geographic resource distribution, maps would be appropriate in a
    dedicated "Geographic View" zone (Tier 3 only).
  `,
  futureCondition: 'Add only if data.projects gains a location field',
  rules: [
    'Never add a map for visual interest — only if data has spatial dimension',
    'If added: Tier 3 only, never in ambient or scan layers',
  ],
}

// ─── VISUALIZATION DECISION MATRIX ───────────────────────────────────────────
// Quick reference: data type → recommended visualization

export const DECISION_MATRIX = [
  { dataType: 'Single metric + trend',          visualization: 'KPI (MetricCard)',           tier: 1,   implemented: true  },
  { dataType: 'Metric over time',               visualization: 'Area/Line chart',            tier: 2,   implemented: true  },
  { dataType: 'Health status',                  visualization: 'Status dot / border accent', tier: '1-3', implemented: true  },
  { dataType: 'Completion percentage',          visualization: 'Progress bar',               tier: 2,   implemented: true  },
  { dataType: 'Portfolio distribution',         visualization: 'Split bar / Donut',          tier: 2,   implemented: true  },
  { dataType: 'Planned vs actual time',         visualization: 'Gantt bar chart',            tier: 2,   implemented: true  },
  { dataType: 'Utilization intensity',          visualization: 'Color-threshold bar (heatmap)', tier: 2, implemented: true  },
  { dataType: 'Directional relationship',       visualization: 'Directed list → graph',      tier: '2-3', implemented: 'partial' },
  { dataType: 'Multi-entity comparison',        visualization: 'Horizontal bar chart',       tier: 3,   implemented: false },
  { dataType: 'Relationship topology',          visualization: 'Node-link graph',            tier: 3,   implemented: false },
  { dataType: 'Geographic distribution',        visualization: 'Map',                        tier: 3,   implemented: false },
]
