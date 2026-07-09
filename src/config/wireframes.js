/**
 * BHIV Executive Command Center — Deliverable 9
 * WIREFRAMES
 *
 * ASCII layout diagrams for every dashboard surface.
 * These are structural wireframes — not visual designs.
 * They define zone placement, relative sizing, and reading order.
 *
 * Surfaces covered:
 *   W1 — Full Dashboard (1280px+, desktop target)
 *   W2 — Detail Panel L2 (40% right overlay)
 *   W3 — Focus Mode L3 (full screen)
 *   W4 — Command Header (always-visible strip)
 *   W5 — Keyboard Shortcut Overlay
 *   W6 — Responsive Collapse (below 1024px)
 */

// ─── W1: FULL DASHBOARD — 1280px+ ─────────────────────────────────────────────
//
// Reading order: Z-pattern — top-left critical, bottom-right log
// Grid: 12 columns, 16px gap
// Scroll: single vertical axis on <main>
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  COMMAND HEADER  [health●] [alerts:3] [confidence:94%↑] [updated:14:28] │  ← always visible, sticky, h=48px
// │  zone-jump: [1][2][3][4][5][6][7]                          [?]          │
// ├─────────────────────────────────────────────────────────────────────────┤
// │                          <main> scrolls below                           │
// ├─────────────────────────────────────────────────────────────────────────┤
// │                                                                         │
// │  ┌─────────────────────────────────────────────────────────────────┐   │
// │  │  EXECUTIVE SUMMARY  [id=zone-executive-summary]   col-span-12   │   │  ← ROW 1: full width KPI bar
// │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │   │
// │  │  │ DELIVERY │ │ ACTIVE   │ │ CRITICAL │ │ PENDING  │ │ UTIL │ │   │
// │  │  │ CONF     │ │ PROJECTS │ │ RISKS    │ │ DECISIONS│ │      │ │   │
// │  │  │  94% ↑   │ │   12     │ │    3     │ │    2     │ │  87% │ │   │
// │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────┘ │   │
// │  └─────────────────────────────────────────────────────────────────┘   │
// │                                                                         │
// │  ┌──────────────────────────────────────┐  ┌──────────────────────┐   │
// │  │  ALERTS  [id=zone-alerts]  col-8     │  │  DELIVERY FORECAST   │   │  ← ROW 2: 8/4 split
// │  │  badge:3                             │  │  col-4               │   │
// │  │  ● CRITICAL  Dependency block—Kiran  │  │  [ConfidenceTrend]   │   │
// │  │  ● HIGH      Resource overload       │  │  ┌──┐ ┌──┐ ┌──┐     │   │
// │  │  ● HIGH      Decision overdue        │  │  │3 │ │2 │ │1 │     │   │
// │  │  ● MEDIUM    Milestone slip +3d      │  │  │ON│ │AT│ │BL│     │   │
// │  └──────────────────────────────────────┘  └──────────────────────┘   │
// │                                                                         │
// │  ┌─────────────────────────────────────────────────────────────────┐   │
// │  │  PROJECT HEALTH  [id=zone-project-health]         col-span-12   │   │  ← ROW 3: full width grid
// │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │   │
// │  │  │■ Alpha     │ │■ Kiran     │ │■ Arjun     │ │■ Delta     │   │   │
// │  │  │ green      │ │ red        │ │ amber      │ │ green      │   │   │
// │  │  │ ████░░ 78% │ │ ███░░░ 34% │ │ █████░ 61% │ │ ████████92%│   │   │
// │  │  │ Ravi S.    │ │ Priya M.   │ │ Amit K.    │ │ Sneha R.   │   │   │
// │  │  │ →Sprint Rev│ │ ⊘ BLOCKED  │ │ →Design Rev│ │ →Launch    │   │   │
// │  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │   │
// │  └─────────────────────────────────────────────────────────────────┘   │
// │                                                                         │
// │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐     │
// │  │  RISKS       │  │  RESOURCES   │  │  DECISIONS               │     │  ← ROW 4: 4/4/4 split
// │  │  [id=zone-   │  │  col-4       │  │  [id=zone-decisions]     │     │
// │  │   risks]     │  │              │  │  col-4                   │     │
// │  │  badge:3     │  │  Backend ████│  │  ● Vendor sel.  OVERDUE  │     │
// │  │  ● Vendor del│  │  Frontend ███│  │  ● Arch review  3d left  │     │
// │  │  ● Scope crp │  │  Design  ██░ │  │  ● Budget reall 6d left  │     │
// │  │  ● Key person│  │  QA      ████│  │                          │     │
// │  └──────────────┘  └──────────────┘  └──────────────────────────┘     │
// │                                                                         │
// │  ┌─────────────────────────────────────────────────────────────────┐   │
// │  │  TIMELINE  [id=zone-timeline]                     col-span-12   │   │  ← ROW 5: full width
// │  │  ┌──────────────────────────┐  ┌──────────────────────────┐    │   │
// │  │  │  [MilestoneGantt]        │  │  Project  Milestone  Var │    │   │
// │  │  │  Alpha  ████             │  │  Alpha    Sprint Rev  ✓  │    │   │
// │  │  │  Arjun  ████░░           │  │  Arjun    Design Rev +3d │    │   │
// │  │  │  Sigma  ████░░░░░        │  │  Sigma    QA Sign-off +5d│    │   │
// │  │  │  Kiran  ████░░░░░░░░░░░░ │  │  Kiran    Dev Complete+15│    │   │
// │  │  └──────────────────────────┘  └──────────────────────────┘    │   │
// │  └─────────────────────────────────────────────────────────────────┘   │
// │                                                                         │
// │  ┌───────────────────────────────────┐  ┌─────────────────────────┐   │
// │  │  DEPENDENCIES  [id=zone-depend.]  │  │  ACTIVITY FEED          │   │  ← ROW 6: 7/5 split
// │  │  col-7                            │  │  col-5                  │   │
// │  │  ● Kiran BLOCKED BY Alpha         │  │  14:28 Sneha closed spr │   │
// │  │  ● Sigma WAITING ON Delta         │  │  13:45 Priya raised risk│   │
// │  │  ● Arjun WAITING ON Omega         │  │  12:10 Dev met mileston │   │
// │  └───────────────────────────────────┘  └─────────────────────────┘   │
// │                                                                         │
// └─────────────────────────────────────────────────────────────────────────┘

export const W1_FULL_DASHBOARD = {
  surface: 'Full Dashboard',
  minWidth: '1280px',
  targetWidth: '1440px',
  maxWidth: '1600px',
  scrollAxis: 'vertical only — single axis',
  header: {
    id: 'CommandHeader',
    height: '48px',
    position: 'sticky top-0',
    zIndex: 10,
    contains: ['health dot', 'alert badge', 'delivery confidence + trend', 'last updated', 'zone jump nav', 'shortcut toggle'],
  },
  rows: [
    {
      id: 'row-1-kpi',
      zones: [{ id: 'ExecutiveSummary', cols: 12, height: '96px' }],
      purpose: 'Five KPIs in one scannable row — answers "how are we doing overall?"',
    },
    {
      id: 'row-2-alerts',
      zones: [
        { id: 'AlertsZone',    cols: 8, minHeight: '160px' },
        { id: 'DeliveryZone',  cols: 4, minHeight: '160px' },
      ],
      purpose: 'Threat (alerts) paired with trajectory (delivery) — both answer urgency',
    },
    {
      id: 'row-3-projects',
      zones: [{ id: 'ProjectHealthGrid', cols: 12, minHeight: '200px' }],
      purpose: 'Full-width grid — needs space for 4-col card layout to breathe',
    },
    {
      id: 'row-4-ops',
      zones: [
        { id: 'RiskZone',      cols: 4, minHeight: '180px' },
        { id: 'ResourceZone',  cols: 4, minHeight: '180px' },
        { id: 'DecisionZone',  cols: 4, minHeight: '180px' },
      ],
      purpose: 'Three threat/action zones — executive scans left to right',
    },
    {
      id: 'row-5-timeline',
      zones: [{ id: 'TimelineZone', cols: 12, minHeight: '200px' }],
      purpose: 'Full-width — Gantt chart needs horizontal space',
    },
    {
      id: 'row-6-log',
      zones: [
        { id: 'DependencyZone', cols: 7, minHeight: '160px' },
        { id: 'ActivityFeed',   cols: 5, minHeight: '160px' },
      ],
      purpose: 'Actionable blockers (7) outweigh log (5) — unequal weight is intentional',
    },
  ],
}

// ─── W2: DETAIL PANEL L2 — 40% RIGHT OVERLAY ─────────────────────────────────
//
// Slides in from right. Dashboard remains visible at 60% left.
// Executive sees both simultaneously — context is preserved.
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  [60% — dashboard, dimmed but visible]  │  [40% — Detail Panel]         │
// │                                         │  ┌────────────────────────┐   │
// │                                         │  │ ← back  PROJECT DETAIL │   │  ← panel header: back + type + close
// │                                         │  │                      ✕ │   │
// │                                         │  ├────────────────────────┤   │
// │                                         │  │ Project Kiran          │   │  ← entity name (H1)
// │                                         │  │ ● BLOCKED  34%         │   │  ← status + progress
// │                                         │  │ Owner: Priya M.        │   │  ← owner (CAPTION)
// │                                         │  ├────────────────────────┤   │
// │                                         │  │ RISKS                  │   │  ← PanelSection
// │                                         │  │ ● Vendor delay CRITICAL│   │
// │                                         │  │ ● Scope creep HIGH     │   │
// │                                         │  ├────────────────────────┤   │
// │                                         │  │ MILESTONES             │   │
// │                                         │  │ Dev Complete  +15d ●   │   │
// │                                         │  ├────────────────────────┤   │
// │                                         │  │ ESCALATIONS            │   │
// │                                         │  │ Vendor unresponsive    │   │
// │                                         │  │ OPEN  2d  Priya→Ravi   │   │
// │                                         │  ├────────────────────────┤   │
// │                                         │  │ EVIDENCE               │   │
// │                                         │  │ 📄 Vendor SLA v2.pdf   │   │
// │                                         │  └────────────────────────┘   │
// └──────────────────────────────────────────────────────────────────────────┘

export const W2_DETAIL_PANEL = {
  surface: 'Detail Panel (L2)',
  trigger: 'single click on any interactive card',
  width: '40vw (min: 320px, max: 576px)',
  position: 'fixed right-0 top-0 h-screen',
  zIndex: 50,
  animation: 'slide-in-right 200ms ease-out',
  backdrop: 'transparent click-to-close layer at z-49',
  layout: {
    header: {
      height: '52px',
      contains: ['back button (if history)', 'panel type label', 'close button ✕'],
      borderBottom: true,
    },
    body: {
      overflow: 'overflow-y-auto',
      padding: 'px-5 py-4',
      sections: ['entity header', 'RISKS', 'MILESTONES', 'ESCALATIONS', 'EVIDENCE'],
    },
  },
  panelTypes: {
    project:    ['entity header', 'risks', 'milestones', 'escalations', 'evidence'],
    risk:       ['entity header', 'mitigation', 'affected projects'],
    alert:      ['entity header', 'SLA', 'related project'],
    decision:   ['entity header', 'options', 'evidence', 'stakeholders'],
    dependency: ['entity header', 'reason', 'duration', 'affected projects'],
  },
  backNavigation: 'panel history stack — back button appears when panelHistory.length > 0',
  exitModes: ['Esc key', '✕ button', 'click backdrop'],
}

// ─── W3: FOCUS MODE L3 — FULL SCREEN ─────────────────────────────────────────
//
// Fades in over the entire viewport. Single project view.
// All other zones hidden. Project switcher top-right.
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  ← Project Kiran  ● BLOCKED  Priya M.    [← prev] [next →]  [Exit F]   │  ← focus header
// ├──────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │  ┌──────────────────────────────────────────────────────────────────┐   │
// │  │  PROGRESS                                                        │   │
// │  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  34%   │   │
// │  └──────────────────────────────────────────────────────────────────┘   │
// │                                                                          │
// │  ┌──────────────────────────┐  ┌───────────────────────────────────┐   │
// │  │  RISKS                   │  │  MILESTONES                       │   │
// │  │  ● Vendor delay CRITICAL │  │  Dev Complete  Feb 14 → Mar 1 +15d│   │
// │  │  ● Scope creep HIGH      │  │                                   │   │
// │  └──────────────────────────┘  └───────────────────────────────────┘   │
// │                                                                          │
// │  ┌──────────────────────────┐  ┌───────────────────────────────────┐   │
// │  │  ESCALATIONS             │  │  EVIDENCE                         │   │
// │  │  Vendor unresponsive 48h │  │  📄 Vendor SLA Agreement v2.pdf   │   │
// │  │  OPEN  2d  Priya → Ravi  │  │  📊 Sprint Velocity Report — Jan  │   │
// │  └──────────────────────────┘  └───────────────────────────────────┘   │
// │                                                                          │
// │  ┌──────────────────────────────────────────────────────────────────┐   │
// │  │  KEYBOARD  [Esc/F = exit]  [← = prev project]  [→ = next]       │   │
// │  └──────────────────────────────────────────────────────────────────┘   │
// └──────────────────────────────────────────────────────────────────────────┘

export const W3_FOCUS_MODE = {
  surface: 'Focus Mode (L3)',
  trigger: 'double-click on ProjectHealthCard',
  coverage: 'full screen — position fixed inset-0',
  zIndex: 55,
  animation: 'fade-in 150ms ease-out',
  layout: {
    header: {
      height: '56px',
      contains: ['project name (H1)', 'status dot', 'owner', 'prev/next switcher', 'exit button'],
      borderBottom: true,
    },
    body: {
      padding: 'p-6',
      grid: '2-column grid for risks/milestones and escalations/evidence',
      sections: ['progress bar (full width)', 'risks + milestones (2-col)', 'escalations + evidence (2-col)', 'keyboard strip'],
    },
  },
  projectSwitcher: {
    position: 'top-right in header',
    order: 'severity-sorted — red projects first',
    keys: ['ArrowLeft = previous', 'ArrowRight = next'],
  },
  exitModes: ['Esc key', 'F key', 'Exit button'],
  dataScope: 'all data filtered to focusProjectId — risks, milestones, escalations, evidence',
}

// ─── W4: COMMAND HEADER — ALWAYS VISIBLE STRIP ───────────────────────────────
//
// Sticky top. Never scrolls away. Tier 1 — zero interaction required to read.
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  ● AMBER  BHIV Command    [!3]  94% ↑  Updated 14:28   1 2 3 4 5 6 7  ?│
// │  └──┘     └────────────┘  └─┘  └────┘  └───────────┘  └─────────────┘  │
// │  health   title           alerts conf   freshness       zone jumps  help │
// └──────────────────────────────────────────────────────────────────────────┘

export const W4_COMMAND_HEADER = {
  surface: 'Command Header',
  height: '48px',
  position: 'sticky top-0 z-10',
  background: 'surface-mid with bottom border',
  refreshPulse: 'green border pulse for 600ms on data refresh',
  staleWarning: 'timestamp turns amber if data > 2 minutes old',
  elements: [
    { slot: 'left',   content: 'health dot + system label' },
    { slot: 'left',   content: 'alert count badge (red if > 0)' },
    { slot: 'center', content: 'delivery confidence % + trend arrow' },
    { slot: 'center', content: 'last updated timestamp' },
    { slot: 'right',  content: 'zone jump buttons 1–7' },
    { slot: 'right',  content: '? shortcut overlay toggle' },
  ],
  tier: 1,
  interaction: 'zone jump buttons scroll to anchor — no panel opens from header',
}

// ─── W5: KEYBOARD SHORTCUT OVERLAY ───────────────────────────────────────────
//
// Centered modal. Triggered by ? key. Click outside to close.
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  [60% opacity black backdrop]                                            │
// │                  ┌──────────────────────────┐                           │
// │                  │  Keyboard Shortcuts       │                           │
// │                  │  ─────────────────────    │                           │
// │                  │  [1–7]    Jump to zone    │                           │
// │                  │  [Esc]    Close / Exit    │                           │
// │                  │  [F]      Exit focus      │                           │
// │                  │  [← →]    Prev / Next     │                           │
// │                  │  [?]      Toggle overlay  │                           │
// │                  │                           │                           │
// │                  │  [Close]                  │                           │
// │                  └──────────────────────────┘                           │
// └──────────────────────────────────────────────────────────────────────────┘

export const W5_SHORTCUT_OVERLAY = {
  surface: 'Keyboard Shortcut Overlay',
  trigger: '? key',
  position: 'fixed inset-0 flex items-center justify-center',
  zIndex: 60,
  backdrop: 'bg-black/60 — click to close',
  panel: {
    width: '288px',
    background: 'surface-mid',
    border: 'border-border',
    padding: 'p-6',
    radius: 'rounded',
  },
  shortcuts: [
    { key: '1–7',  action: 'Jump to zone' },
    { key: 'Esc',  action: 'Close panel / Exit focus' },
    { key: 'F',    action: 'Exit focus mode' },
    { key: '← →',  action: 'Prev / Next project in focus' },
    { key: '?',    action: 'Toggle this overlay' },
  ],
}

// ─── W6: RESPONSIVE COLLAPSE — BELOW 1024px ──────────────────────────────────
//
// All multi-column rows collapse to single column.
// Reading order preserved — zones stack in the same priority order.
//
// ┌──────────────────────────────────┐
// │  COMMAND HEADER (full width)     │  ← always full width
// ├──────────────────────────────────┤
// │  EXECUTIVE SUMMARY               │  ← KPIs wrap to 2-col grid
// │  ┌──────┐ ┌──────┐ ┌──────┐     │
// │  │ 94%  │ │  12  │ │   3  │     │
// │  └──────┘ └──────┘ └──────┘     │
// ├──────────────────────────────────┤
// │  ALERTS (full width)             │  ← was col-8, now full
// ├──────────────────────────────────┤
// │  DELIVERY FORECAST (full width)  │  ← was col-4, now full
// ├──────────────────────────────────┤
// │  PROJECT HEALTH (2-col grid)     │  ← was 4-col, now 2-col
// │  ┌────────────┐ ┌────────────┐   │
// │  │ Alpha      │ │ Kiran      │   │
// │  └────────────┘ └────────────┘   │
// ├──────────────────────────────────┤
// │  RISKS (full width)              │
// ├──────────────────────────────────┤
// │  RESOURCES (full width)          │
// ├──────────────────────────────────┤
// │  DECISIONS (full width)          │
// ├──────────────────────────────────┤
// │  TIMELINE (full width)           │
// ├──────────────────────────────────┤
// │  DEPENDENCIES (full width)       │
// ├──────────────────────────────────┤
// │  ACTIVITY FEED (full width)      │
// └──────────────────────────────────┘

export const W6_RESPONSIVE_COLLAPSE = {
  surface: 'Responsive Collapse',
  breakpoint: 'below 1024px (lg)',
  behavior: 'all col-span-N collapse to col-span-12',
  exceptions: [
    'CommandHeader: always full width at all breakpoints',
    'FocusMode: always full screen at all breakpoints',
    'DetailPanel: 40% width on xl+, 100% width on md and below',
    'ProjectHealthGrid: 4-col → 2-col at lg, 1-col at sm',
    'ExecutiveSummary KPIs: 5-col → 3-col at lg, 2-col at sm',
  ],
  stackOrder: 'Priority order preserved — alerts before delivery, risks before resources before decisions',
}

// ─── WIREFRAME SUMMARY ────────────────────────────────────────────────────────

export const WIREFRAME_SUMMARY = {
  totalSurfaces: 6,
  surfaces: [
    { id: 'W1', name: 'Full Dashboard',          status: 'defined' },
    { id: 'W2', name: 'Detail Panel L2',         status: 'defined' },
    { id: 'W3', name: 'Focus Mode L3',           status: 'defined' },
    { id: 'W4', name: 'Command Header',          status: 'defined' },
    { id: 'W5', name: 'Keyboard Shortcut Overlay', status: 'defined' },
    { id: 'W6', name: 'Responsive Collapse',     status: 'defined' },
  ],
  implementationStatus: 'All 6 surfaces are fully implemented in src/components/',
  figmaNote: 'These ASCII wireframes are the structural specification. Visual fidelity is in the running application at localhost:5173.',
}
