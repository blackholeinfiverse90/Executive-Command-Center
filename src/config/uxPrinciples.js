/**
 * PHASE 4 — USER EXPERIENCE MODEL
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is the interaction contract of the Executive Command Center.
 * It defines HOW the system responds to the executive — not what it shows.
 *
 * Core principle: Every interaction must cost less than it reveals.
 * An executive's time is the scarcest resource in the system.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── PRINCIPLE 1: PROGRESSIVE DISCLOSURE ─────────────────────────────────────
// Information is revealed in layers. Each layer requires deliberate action.
// The executive is never overwhelmed — they choose depth.
//
// Layer 0 → Tier 1: CommandHeader — zero interaction, always visible
// Layer 1 → Tier 2: Dashboard zones — visible on load, no click required
// Layer 2 → Tier 3 L2: DetailPanel — single click, 40% overlay, context preserved
// Layer 3 → Tier 3 L3: FocusMode — double click, full screen, single project

export const PROGRESSIVE_DISCLOSURE = {
  layers: [
    {
      level: 0,
      name: 'Ambient Awareness',
      trigger: 'none — always visible',
      surface: 'CommandHeader',
      reveals: 'System health, alert count, delivery confidence, data freshness',
      exitTrigger: null,
    },
    {
      level: 1,
      name: 'Situational Scan',
      trigger: 'page load — no interaction',
      surface: 'Dashboard zones',
      reveals: 'All Tier 2 zones — portfolio, alerts, risks, resources, timeline, decisions',
      exitTrigger: null,
    },
    {
      level: 2,
      name: 'Operational Drill-Down',
      trigger: 'single click on any interactive card',
      surface: 'DetailPanel (40% right overlay)',
      reveals: 'Entity-specific Tier 3 data — risks, milestones, escalations, evidence',
      exitTrigger: 'Esc key | ✕ button | click outside panel',
      animation: 'slide-in from right (200ms ease-out)',
      contextPreservation: 'Dashboard remains visible behind panel — executive sees both',
    },
    {
      level: 3,
      name: 'Single-Project Command',
      trigger: 'double click on ProjectHealthCard',
      surface: 'FocusMode (full screen overlay)',
      reveals: 'Complete project view — all zones filtered to one project',
      exitTrigger: 'Esc key | F key | Exit button',
      animation: 'fade-in (150ms)',
      contextPreservation: 'Project switcher visible — can move to next project without exiting',
    },
  ],
}

// ─── PRINCIPLE 2: CONTEXT PRESERVATION ───────────────────────────────────────
// The executive must always know where they are and how to get back.
// Opening a detail view must not destroy the context they came from.

export const CONTEXT_PRESERVATION = {
  rules: [
    // Rule: DetailPanel overlays — never replaces — the dashboard
    // The executive can see the dashboard behind the panel at all times
    'DetailPanel is a 40% right overlay — 60% of dashboard remains visible',

    // Rule: Panel history enables back navigation
    // If executive clicks a risk inside a project panel, they can go back to the project
    'Panel history stack: each openPanel() push, back button pops',

    // Rule: FocusMode shows which project is active
    // Project name + status dot always visible in FocusMode header
    'FocusMode header always shows: project name, status, owner',

    // Rule: FocusMode project switcher
    // Executive can switch between projects without exiting FocusMode
    'FocusMode has prev/next project switcher — no exit required to switch',

    // Rule: Closing panel returns to exact scroll position
    // Executive should not lose their place in the dashboard
    'Scroll position preserved when DetailPanel opens and closes',
  ],
}

// ─── PRINCIPLE 3: LOW-SCROLL NAVIGATION ──────────────────────────────────────
// An executive should reach any zone in ≤ 2 interactions.
// Scrolling is a last resort — not the primary navigation model.

export const LOW_SCROLL_NAVIGATION = {
  rules: [
    'Zone IDs are anchor targets — CommandHeader links jump to any zone',
    'Keyboard shortcut map: 1=Summary, 2=Alerts, 3=Projects, 4=Risks, 5=Timeline',
    'Critical alerts in CommandHeader are clickable — jump directly to AlertsZone',
    'All critical content visible above the fold on 1080p screens',
  ],
  zoneAnchors: {
    '1': 'zone-executive-summary',
    '2': 'zone-alerts',
    '3': 'zone-project-health',
    '4': 'zone-risks',
    '5': 'zone-timeline',
    '6': 'zone-decisions',
    '7': 'zone-dependencies',
  },
}

// ─── PRINCIPLE 4: FAST SCANNING ──────────────────────────────────────────────
// Every zone must be scannable in < 2 seconds.
// The executive reads color before text. Shape before number. Position before label.

export const FAST_SCANNING = {
  rules: [
    // Pre-attentive attributes used in order of scan speed:
    // 1. Color (status dots, border accents) — 50ms
    // 2. Position (severity sort — worst top-left) — 100ms
    // 3. Size (display-size numbers for KPIs) — 150ms
    // 4. Shape (progress bars, utilization bars) — 200ms
    // 5. Text (labels, names) — 500ms+
    'Color encodes status before text is read',
    'Severity sort ensures worst item is always top-left — no searching',
    'KPI values use display (32px bold) — readable from distance',
    'Progress bars give completion at a glance — no number required',
    'Zone badges show count of problems — executive knows severity before reading list',
  ],
  scanOrder: 'color → position → size → shape → text',
}

// ─── PRINCIPLE 5: MINIMAL COGNITIVE LOAD ─────────────────────────────────────
// Every element on screen must earn its place.
// If it doesn't help the executive make a decision, it should not be visible.

export const MINIMAL_COGNITIVE_LOAD = {
  rules: [
    'Maximum 4 signals in Tier 1 — cognitive working memory limit',
    'Each zone answers exactly one question — no mixed concerns',
    'No decorative elements — every color, icon, and border is semantic',
    'Suppression list enforced — 12 categories of data hidden until requested',
    'Zone labels are questions, not titles — "What is on fire?" not "Alerts"',
    'Timestamps show relative time where possible — "2h ago" not "14:28:03"',
    'Empty states are informative — "No active risks" is a positive signal',
  ],
}

// ─── PRINCIPLE 6: ALERT PRIORITIZATION ───────────────────────────────────────
// The most urgent item in the system must be the first thing the executive sees.
// Alert fatigue is a real risk — the system must earn the executive's attention.

export const ALERT_PRIORITIZATION = {
  rules: [
    'Severity sort is non-negotiable — critical always before high, high before medium',
    'SLA remaining is always visible — urgency is time-bounded',
    'Alert count badge in CommandHeader — executive knows urgency before scrolling',
    'Critical alerts use red border + red text — two visual channels, not one',
    'Alert badge caps at tier1MaxItems (4) — "4 of N" prevents false precision',
    'Resolved alerts are suppressed — only active alerts shown in Tier 2',
  ],
  severityOrder: ['critical', 'high', 'medium', 'low'],
  visualChannels: {
    critical: 'red border + red text + red badge',
    high:     'amber border + amber text',
    medium:   'yellow border + yellow text',
    low:      'blue border + blue text',
  },
}

// ─── PRINCIPLE 7: FOCUS MODE ─────────────────────────────────────────────────
// When an executive needs to understand one project completely,
// everything else must disappear. No distractions. No context switching.

export const FOCUS_MODE = {
  trigger:    'double-click on ProjectHealthCard',
  exitKeys:   ['Escape', 'f'],
  exitButton: 'visible top-right — always accessible',
  layout:     'full screen — all other zones hidden',
  shows: [
    'Project name, status, owner — always in header',
    'Progress metric (large display number)',
    'All risks filtered to this project',
    'All milestones filtered to this project',
    'All escalations filtered to this project',
    'All evidence filtered to this project',
    'Project-level activity feed',
  ],
  projectSwitcher: {
    enabled: true,
    position: 'top-right, beside exit button',
    shows: 'prev/next project by severity order',
    // Executive can move through red → amber → green projects
    // without exiting Focus Mode — maintains flow state
  },
  keyboardShortcuts: {
    'Escape / F': 'Exit Focus Mode',
    'ArrowLeft':  'Previous project (by severity)',
    'ArrowRight': 'Next project (by severity)',
  },
}

// ─── PRINCIPLE 8: OPERATIONAL DRILL-DOWN ─────────────────────────────────────
// Every Tier 2 card that represents a problem must be clickable.
// Clicking reveals the investigation surface without losing the command view.

export const OPERATIONAL_DRILL_DOWN = {
  L2_panel: {
    trigger:   'single click on interactive card',
    width:     '40vw (min 320px, max 576px)',
    position:  'fixed right overlay',
    animation: 'slide-in 200ms ease-out',
    history:   'stack-based — back button navigates to previous panel',
    exitModes: ['Esc key', '✕ button', 'click backdrop'],
    panelTypes: {
      project:    'Overview → Risks → Milestones → Escalations → Evidence',
      risk:       'Risk detail → Mitigation → Affected projects',
      alert:      'Alert detail → SLA → Related project',
      decision:   'Decision context → Options → Evidence → Stakeholders',
      dependency: 'Blocker detail → Reason → Duration → Affected projects',
    },
  },
  L3_focus: {
    trigger:   'double click on ProjectHealthCard',
    coverage:  'full screen',
    animation: 'fade-in 150ms',
    exitModes: ['Esc', 'F key', 'Exit button'],
    switcher:  'ArrowLeft / ArrowRight to move between projects',
  },
}

// ─── PRINCIPLE 9: DATA FRESHNESS & AUTO-REFRESH ───────────────────────────────
// Stale data is worse than no data — it creates false confidence.
// The executive must always know when data was last updated.

export const DATA_FRESHNESS = {
  refreshInterval: 30000, // 30 seconds
  indicator: {
    location:  'CommandHeader — always visible',
    format:    '"Updated HH:MM" — absolute time',
    pulse:     'brief green pulse on CommandHeader border when data refreshes',
    staleThreshold: 120000, // 2 minutes — show warning if data is older than this
    staleIndicator: 'timestamp turns amber if data is > 2 minutes old',
  },
  rules: [
    'Timestamp always visible in Tier 1 — trust signal',
    'Auto-refresh every 30s — executive never sees stale data without knowing',
    'Visual pulse on refresh — executive knows data just updated',
    'Stale warning if refresh fails — amber timestamp after 2 minutes',
  ],
}

// ─── PRINCIPLE 10: KEYBOARD EFFICIENCY ───────────────────────────────────────
// An executive using a keyboard should never need a mouse for navigation.

export const KEYBOARD_EFFICIENCY = {
  globalShortcuts: {
    'Escape':     'Close DetailPanel / Exit FocusMode',
    '1–7':        'Jump to zone by number (see LOW_SCROLL_NAVIGATION.zoneAnchors)',
    'F':          'Exit FocusMode (when in FocusMode)',
    'ArrowLeft':  'Previous project (in FocusMode)',
    'ArrowRight': 'Next project (in FocusMode)',
    '?':          'Show keyboard shortcut overlay',
  },
  cardNavigation: {
    'Tab':        'Move focus between interactive cards',
    'Enter':      'Open DetailPanel (L2) for focused card',
    'Space':      'Open DetailPanel (L2) for focused card',
  },
  rules: [
    'All interactive cards have tabIndex=0 and role=button',
    'All interactive cards handle Enter and Space keydown',
    'Focus ring must be visible — never suppress outline entirely',
    'Keyboard shortcuts do not conflict with browser defaults',
  ],
}
