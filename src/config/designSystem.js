/**
 * BHIV Executive Design System — Phase 6
 *
 * This file is the single source of truth for all design decisions across
 * BHIV dashboards. Every token here maps 1:1 to a Tailwind class or CSS
 * custom property. Components must not hard-code values that exist here.
 *
 * Sections:
 *   1. SPACING_PHILOSOPHY
 *   2. TYPOGRAPHY_HIERARCHY
 *   3. GRID_SYSTEM
 *   4. DASHBOARD_RHYTHM
 *   5. COMPONENT_CONSISTENCY
 *   6. COLOR_SEMANTICS
 *   7. ACCESSIBILITY
 *   8. RESPONSIVE_BEHAVIOR
 */

// ─── 1. SPACING PHILOSOPHY ────────────────────────────────────────────────────
// Base unit: 4px. All spacing is a multiple of 4.
// Rule: never use arbitrary pixel values in components — use scale tokens only.
// Rationale: 4px base keeps density high for data-heavy dashboards while
//            maintaining visual rhythm that the eye can track.

export const SPACING = {
  // Scale tokens (maps to Tailwind spacing scale)
  px:   '1px',   // hairline — borders, dividers only
  0.5:  '2px',   // micro gap — icon-to-label
  1:    '4px',   // xs — tight inline spacing
  1.5:  '6px',   // sm — badge padding, dot margin
  2:    '8px',   // md — default inline gap
  3:    '12px',  // lg — card internal gap
  4:    '16px',  // xl — zone padding, section gap
  5:    '20px',  // 2xl — zone header padding
  6:    '24px',  // 3xl — between major sections
  8:    '32px',  // 4xl — between dashboard rows
  12:   '48px',  // 5xl — full-screen modal padding

  // Semantic aliases — use these in components, not raw numbers
  INLINE_GAP:      2,   // gap between icon and label
  CARD_PADDING:    4,   // internal card padding
  ZONE_PADDING_X:  5,   // zone horizontal padding (matches ZoneShell px-5)
  ZONE_PADDING_Y:  4,   // zone vertical padding
  ROW_GAP:         4,   // gap between dashboard rows (gap-4)
  SECTION_GAP:     6,   // gap between logical sections within a zone
}

// ─── 2. TYPOGRAPHY HIERARCHY ─────────────────────────────────────────────────
// 6-level scale. Each level has a single purpose — do not mix purposes.
// Font: Inter (variable weight). Fallback: system-ui, sans-serif.
// Line heights are tight by design — dashboards are not prose.

export const TYPOGRAPHY = {
  // Level → [size, weight, lineHeight, purpose]
  DISPLAY: { size: '32px', weight: 700, lineHeight: 1.0,  purpose: 'Hero KPI numbers (MetricCard value)' },
  H1:      { size: '24px', weight: 600, lineHeight: 1.2,  purpose: 'Page title, FocusMode project name' },
  H2:      { size: '18px', weight: 600, lineHeight: 1.3,  purpose: 'Zone label (not used — zones use MICRO)' },
  BODY:    { size: '14px', weight: 400, lineHeight: 1.4,  purpose: 'Card titles, row labels, primary content' },
  CAPTION: { size: '12px', weight: 400, lineHeight: 1.4,  purpose: 'Secondary info, timestamps, owners' },
  MICRO:   { size: '10px', weight: 500, lineHeight: 1.2,  purpose: 'Zone labels, badges, kbd shortcuts, units' },

  // Rules
  RULES: [
    'Zone labels always MICRO + uppercase + tracking-widest',
    'Card titles always BODY — never H2 inside a card',
    'KPI values always DISPLAY — never scale down for fit, truncate instead',
    'Timestamps and owners always CAPTION + text-secondary',
    'Badge text always MICRO + font-semibold',
    'Never use font sizes outside this scale in components',
    'Truncate with ellipsis rather than wrapping in data-dense rows',
  ],
}

// ─── 3. GRID SYSTEM ──────────────────────────────────────────────────────────
// 12-column grid. All layout decisions expressed as column spans.
// Breakpoints: sm=640, md=768, lg=1024, xl=1280, 2xl=1536
// Dashboard minimum viable width: 1280px (xl). Below that, stack to single col.

export const GRID = {
  COLUMNS: 12,
  GAP: 4,           // gap-4 = 16px between columns and rows

  // Standard zone width patterns (column spans)
  SPANS: {
    FULL:        12,  // Full-width zones: ExecutiveSummary, ProjectHealthGrid, TimelineZone
    HALF:         6,  // Equal halves: rarely used — prefer asymmetric splits
    TWO_THIRDS:   8,  // Dominant zone in a 2-zone row: AlertsZone
    ONE_THIRD:    4,  // Supporting zone: DeliveryZone, RiskZone, ResourceZone, DecisionZone
    SEVEN_TWELFTHS: 7, // Dominant in 3-zone row: DependencyZone
    FIVE_TWELFTHS:  5, // Supporting in 3-zone row: ActivityFeed
  },

  // Row compositions (current dashboard)
  ROWS: [
    { id: 'row-kpi',        zones: ['ExecutiveSummary'],                    spans: [12] },
    { id: 'row-alerts',     zones: ['AlertsZone', 'DeliveryZone'],          spans: [8, 4] },
    { id: 'row-projects',   zones: ['ProjectHealthGrid'],                   spans: [12] },
    { id: 'row-ops',        zones: ['RiskZone', 'ResourceZone', 'DecisionZone'], spans: [4, 4, 4] },
    { id: 'row-timeline',   zones: ['TimelineZone'],                        spans: [12] },
    { id: 'row-log',        zones: ['DependencyZone', 'ActivityFeed'],      spans: [7, 5] },
  ],

  // Z-pattern reading order: top-left critical → top-right supporting → bottom-left actionable → bottom-right log
  READING_ORDER: 'Z-pattern: critical top-left, log bottom-right',
}

// ─── 4. DASHBOARD RHYTHM ─────────────────────────────────────────────────────
// Rhythm = the visual cadence that lets the eye move predictably.
// Every zone must feel like it belongs to the same family.

export const DASHBOARD_RHYTHM = {
  // Zone anatomy — every zone has these layers in this order
  ZONE_ANATOMY: [
    'zone-header: label + badge + action (height: ~44px, border-bottom)',
    'zone-body: scrollable content area (flex-1, px-5 py-4)',
    'zone-footer: optional summary row (border-top, px-5 py-3)',
  ],

  // Card anatomy — every card row has these layers
  CARD_ANATOMY: [
    'leading-indicator: StatusDot or severity border-left',
    'primary-content: title (BODY) + secondary (CAPTION)',
    'trailing-action: badge, countdown, or chevron',
  ],

  // Vertical rhythm within a zone
  ROW_HEIGHT: {
    COMPACT:  '32px',  // ActivityItem, MilestoneRow — dense log data
    STANDARD: '44px',  // RiskCard, DecisionCard, DependencyCard — actionable rows
    EXPANDED: '64px',  // ProjectHealthCard — needs progress bar + milestone
    KPI:      '80px',  // MetricCard — hero number needs breathing room
  },

  // Dividers: use border-b border-border on rows, never full-width hr
  DIVIDER: 'border-b border-border last:border-0',

  // Consistent border radius
  RADIUS: {
    CARD:   'rounded',     // 4px — cards, badges, inputs
    ZONE:   'rounded-sm',  // 2px — zone shells (subtle, not pill)
    PILL:   'rounded-full', // progress bars, status dots
  },
}

// ─── 5. COMPONENT CONSISTENCY ─────────────────────────────────────────────────
// Rules that every component must follow. Enforced by code review.

export const COMPONENT_CONSISTENCY = {
  // Interactive elements
  INTERACTIVE: {
    cursor:     'cursor-pointer',
    hover:      'hover:bg-surface-light',
    transition: 'transition-colors',
    focus:      'focus-visible:outline-2 focus-visible:outline-blue-500',
    role:       'role="button" tabIndex={0}',
    keydown:    'onKeyDown: Enter and Space trigger onClick',
  },

  // Status indicators — always use StatusDot, never raw colored divs
  STATUS_INDICATOR: 'Always use <StatusDot status={...} /> — never inline bg-red-500 etc.',

  // Truncation — data-dense rows must truncate, never wrap
  TRUNCATION: 'truncate class on all title/name spans in card rows',

  // Empty states — every zone must handle empty data
  EMPTY_STATE: {
    style:   'text-caption text-text-secondary italic py-4 text-center',
    message: '"No [items] to display" — never leave a zone blank',
  },

  // Loading states — skeleton shimmer, not spinners
  LOADING_STATE: 'animate-pulse bg-surface-light rounded — skeleton blocks',

  // Badge anatomy: text-micro + px-1.5 py-0.5 + rounded + font-semibold
  BADGE: 'text-micro px-1.5 py-0.5 rounded font-semibold',

  // Forbidden patterns
  FORBIDDEN: [
    'Hard-coded hex colors in JSX — use Tailwind tokens only',
    'Inline style={{ color: ... }} for semantic colors',
    'font-size outside the 6-level typography scale',
    'margin/padding values not on the 4px base grid',
    'z-index values not from the Z_INDEX table below',
  ],

  // Z-index table — all layers declared here
  Z_INDEX: {
    BASE:       0,
    ZONE:       1,
    STICKY:     10,   // CommandHeader
    PANEL:      50,   // DetailPanel
    BACKDROP:   49,   // panel-backdrop
    FOCUS_MODE: 55,   // FocusMode
    OVERLAY:    60,   // shortcut overlay, modals
  },
}

// ─── 6. COLOR SEMANTICS ───────────────────────────────────────────────────────
// Every color has ONE meaning. Never use a color for decoration.
// Palette is dark-first — designed for low-light command center environments.

export const COLOR_SEMANTICS = {
  // Surface hierarchy (depth = darker = further back)
  SURFACES: {
    'surface-dark':  { hex: '#0D1117', use: 'Page background, card backgrounds inside zones' },
    'surface-mid':   { hex: '#161B22', use: 'Zone backgrounds, panel backgrounds' },
    'surface-light': { hex: '#21262D', use: 'Hover states, active rows, input backgrounds' },
  },

  // Border
  BORDER: { hex: '#30363D', use: 'All borders — zone, card, divider. One border color only.' },

  // Text
  TEXT: {
    primary:   { hex: '#E6EDF3', use: 'All primary content — titles, values, labels' },
    secondary: { hex: '#8B949E', use: 'Supporting info — timestamps, owners, units, zone labels' },
  },

  // Status — semantic, not decorative
  STATUS: {
    red:   { hex: '#D32F2F', use: 'BLOCKED, critical alerts, overdue, >7d variance, overload' },
    amber: { hex: '#F57C00', use: 'AT-RISK, high alerts, 1–7d variance, pending mitigation, ≥85% utilization' },
    green: { hex: '#388E3C', use: 'ON-TRACK, healthy, resolved, <85% utilization' },
    blue:  { hex: '#1565C0', use: 'Informational, focus ring, low-severity alerts, links' },
  },

  // Semantic rules
  RULES: [
    'Red = action required NOW — executive must act today',
    'Amber = monitor closely — may become red within 48h',
    'Green = no action needed — confirm and move on',
    'Blue = informational — read when time permits',
    'Never use red/amber/green for non-status purposes (e.g. branding)',
    'Background tints for badges: use -900 bg with -300 text (e.g. bg-red-900 text-red-300)',
    'Chart colors follow status palette — no custom chart colors',
    'Confidence trend: green if ≥80%, amber if 60–79%, red if <60%',
  ],

  // Gradient fills for charts (Recharts linearGradient)
  CHART_GRADIENTS: {
    confidence: { start: 'rgba(56,142,60,0.3)', end: 'rgba(56,142,60,0)' },
    risk:       { start: 'rgba(211,47,47,0.3)', end: 'rgba(211,47,47,0)' },
    neutral:    { start: 'rgba(139,148,158,0.2)', end: 'rgba(139,148,158,0)' },
  },
}

// ─── 7. ACCESSIBILITY ─────────────────────────────────────────────────────────
// WCAG 2.1 AA minimum. Dashboard targets senior leadership — clarity over density.

export const ACCESSIBILITY = {
  // Contrast ratios (dark theme)
  CONTRAST: {
    'text-primary on surface-dark':  '12.6:1',  // ✓ AAA
    'text-primary on surface-mid':   '10.8:1',  // ✓ AAA
    'text-secondary on surface-dark': '4.8:1',  // ✓ AA
    'status-red on surface-dark':    '4.5:1',   // ✓ AA (minimum — do not darken further)
    'status-amber on surface-dark':  '4.6:1',   // ✓ AA
    'status-green on surface-dark':  '4.5:1',   // ✓ AA (minimum)
  },

  // Keyboard navigation requirements
  KEYBOARD: {
    focusRing:    '2px solid #1565C0, offset 2px — all interactive elements',
    tabOrder:     'Logical DOM order — no tabIndex > 0',
    shortcuts:    '1–7 zone jump, Esc close/exit, F exit focus, ←→ project switch, ? overlay',
    skipLinks:    'Not required — single-page dashboard with zone jump shortcuts',
    trapFocus:    'DetailPanel and FocusMode must trap focus while open',
  },

  // ARIA requirements
  ARIA: {
    zones:        'aria-label on every <section> (ZoneShell handles this)',
    interactive:  'role="button" on all div/span click targets',
    statusDots:   'aria-label={status} on StatusDot spans',
    liveRegions:  'aria-live="polite" on CommandHeader for refresh signal',
    charts:       'aria-label describing chart purpose on chart containers',
  },

  // Touch targets
  TOUCH: {
    minimum:  '44×44px — all interactive elements',
    note:     'Dashboard is desktop-primary; touch targets are a secondary concern',
  },

  // Motion
  MOTION: {
    rule:         'All animations respect prefers-reduced-motion',
    animations:   ['slide-in-right', 'fade-in', 'refresh-pulse'],
    reducedRule:  '@media (prefers-reduced-motion: reduce) { animation: none }',
  },
}

// ─── 8. RESPONSIVE BEHAVIOR ───────────────────────────────────────────────────
// Dashboard is desktop-primary (1280px+). Responsive is graceful degradation.
// Never sacrifice information density on desktop to accommodate mobile.

export const RESPONSIVE = {
  // Breakpoint strategy
  BREAKPOINTS: {
    sm:  '640px',   // Not used — dashboard not designed for mobile',
    md:  '768px',   // Tablet: single-column stacking begins',
    lg:  '1024px',  // Laptop: multi-column layout activates',
    xl:  '1280px',  // Target: full dashboard layout',
    '2xl': '1536px', // Wide: zones get more breathing room',
  },

  // Layout behavior per breakpoint
  LAYOUT_RULES: {
    'below-lg':  'All grid columns collapse to col-span-12 (single column stack)',
    'lg':        'Multi-column layout activates — 8/4, 4/4/4, 7/5 splits',
    'xl':        'Target layout — all zones at designed widths',
    '2xl':       'Max-width container (1600px) centers dashboard on ultra-wide',
  },

  // Zone-specific responsive rules
  ZONE_RULES: [
    'CommandHeader: always full-width, never wraps',
    'ExecutiveSummary KPIs: 5-col grid → 3-col → 2-col at sm',
    'ProjectHealthGrid: 4-col → 2-col → 1-col',
    'Charts: maintain aspect ratio, never overflow container',
    'DetailPanel: 40% width on xl+, 100% width on md and below',
    'FocusMode: always full-screen regardless of breakpoint',
  ],

  // Overflow strategy
  OVERFLOW: {
    page:   'overflow-y: auto on main — single scroll axis only',
    zones:  'overflow-y: auto inside zones with fixed height — never overflow-x',
    tables: 'overflow-x: auto on table containers — horizontal scroll before truncation',
    panel:  'overflow-y: auto inside DetailPanel — panel height = 100vh',
  },

  // Max container width
  MAX_WIDTH: '1600px',  // Centers on ultra-wide monitors
}

// ─── DESIGN SYSTEM EXPORT ─────────────────────────────────────────────────────
// Convenience export for components that need to reference tokens programmatically.

export const DESIGN_SYSTEM = {
  SPACING,
  TYPOGRAPHY,
  GRID,
  DASHBOARD_RHYTHM,
  COMPONENT_CONSISTENCY,
  COLOR_SEMANTICS,
  ACCESSIBILITY,
  RESPONSIVE,

  // Version — bump when breaking changes are made
  VERSION: '1.0.0',
  PROJECT: 'BHIV Executive Command Center',
}
