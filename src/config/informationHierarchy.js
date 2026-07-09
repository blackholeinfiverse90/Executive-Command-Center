/**
 * PHASE 1 — EXECUTIVE THINKING MODEL
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is the cognitive contract of the Executive Command Center.
 * It defines WHAT an executive needs, WHEN they need it, and WHY.
 *
 * Design principle: An executive is not reading a report.
 * They are scanning for deviation from expected state.
 * The system must answer three questions in order:
 *
 *   Q1 (0–2s)  → "Is anything broken right now?"
 *   Q2 (2–5s)  → "Which projects need my attention?"
 *   Q3 (5–10s) → "What do I need to decide or unblock?"
 *
 * Everything else is evidence — available on demand, never forced.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── TIER 1: IMMEDIATE COGNITION (0–3 seconds) ───────────────────────────────
// The executive must absorb this without any interaction.
// Rendered always-visible in the Command Header.
// Rule: Maximum 4 signals. Each must be a single scannable value or color.
// Cognitive load budget: ZERO — these are pre-attentive signals.

export const TIER_1 = {
  label: 'Immediate Cognition',
  timeWindow: '0–3s',
  cognitiveLoad: 'zero',
  interactionRequired: false,
  signals: [
    {
      id: 'overall_health',
      label: 'System Health',
      dataPath: 'summary.overallHealth',
      renderAs: 'status_dot + label',
      // Why first: One color tells the executive whether to be in alert mode or scan mode.
      // Green = proceed normally. Amber = heightened attention. Red = immediate action.
      cognitiveRole: 'orientation',
      priority: 1,
    },
    {
      id: 'critical_alert_count',
      label: 'Active Alerts',
      dataPath: 'alerts[severity=critical|high].length',
      renderAs: 'badge_count',
      // Why second: Count of unresolved critical signals. Non-zero = something demands action.
      cognitiveRole: 'urgency_signal',
      priority: 2,
    },
    {
      id: 'delivery_confidence',
      label: 'Delivery Confidence',
      dataPath: 'summary.deliveryConfidence',
      renderAs: 'percentage + trend_arrow',
      // Why third: Single number encoding whether the portfolio is on trajectory.
      // Trend arrow shows direction — more important than the absolute number.
      cognitiveRole: 'trajectory_signal',
      priority: 3,
    },
    {
      id: 'last_updated',
      label: 'Data Freshness',
      dataPath: 'meta.lastUpdated',
      renderAs: 'timestamp',
      // Why fourth: Executives must know if they are looking at stale data.
      // Trust in the dashboard depends on data recency.
      cognitiveRole: 'trust_signal',
      priority: 4,
    },
  ],
}

// ─── TIER 2: SITUATIONAL AWARENESS (3–10 seconds) ────────────────────────────
// The executive scans this after orientation.
// Rendered in the main dashboard body — always visible, no click required.
// Rule: Each zone answers exactly one question. No zone mixes concerns.
// Cognitive load budget: LOW — pattern recognition, not reading.

export const TIER_2 = {
  label: 'Situational Awareness',
  timeWindow: '3–10s',
  cognitiveLoad: 'low',
  interactionRequired: false,
  zones: [
    {
      id: 'zone_alerts',
      label: 'Alerts & Escalations',
      question: 'What is on fire right now?',
      dataPath: 'alerts',
      renderAs: 'prioritized_list',
      sortBy: ['severity', 'slaRemaining'],
      // Cognitive rule: Sorted by severity then SLA. Executive reads top-to-bottom.
      // First item is always the most urgent thing in the system.
      cognitiveRole: 'threat_identification',
      priority: 1,
    },
    {
      id: 'zone_project_health',
      label: 'Project Health Grid',
      question: 'Which projects are healthy, at risk, or blocked?',
      dataPath: 'projects',
      renderAs: 'status_grid',
      sortBy: ['status_severity'], // red first, amber second, green last
      // Cognitive rule: Color-coded grid. Executive sees the red/amber cluster instantly.
      // Problem projects always appear top-left.
      cognitiveRole: 'portfolio_scan',
      priority: 2,
    },
    {
      id: 'zone_decisions',
      label: 'Decisions Pending',
      question: 'What requires my decision today?',
      dataPath: 'decisions',
      renderAs: 'deadline_list',
      sortBy: ['daysLeft'], // overdue first
      // Cognitive rule: Overdue decisions are the executive's direct accountability.
      // These require action from the executive, not the team.
      cognitiveRole: 'action_required',
      priority: 3,
    },
    {
      id: 'zone_risks',
      label: 'Top Risks',
      question: 'What could derail delivery?',
      dataPath: 'risks',
      renderAs: 'severity_list',
      sortBy: ['severity'],
      // Cognitive rule: Risks without mitigation owners are more dangerous than
      // high-severity risks with active mitigation. Mitigation status is visible.
      cognitiveRole: 'threat_assessment',
      priority: 4,
    },
    {
      id: 'zone_resources',
      label: 'Resource Utilization',
      question: 'Are any teams overloaded or idle?',
      dataPath: 'resources',
      renderAs: 'utilization_bars',
      sortBy: ['allocated'], // highest first
      // Cognitive rule: Overload (>100%) is a system risk, not just a people issue.
      // Idle capacity (<50%) signals misallocation. Both extremes need attention.
      cognitiveRole: 'capacity_scan',
      priority: 5,
    },
    {
      id: 'zone_timeline',
      label: 'Timeline / Delivery',
      question: 'Are we on schedule?',
      dataPath: 'milestones',
      renderAs: 'variance_table',
      sortBy: ['variance'], // highest slip first
      // Cognitive rule: Variance (planned vs forecast) is the only number that matters.
      // Zero variance = healthy. Positive variance = slipping. Show delta, not the date.
      cognitiveRole: 'schedule_health',
      priority: 6,
    },
  ],
}

// ─── TIER 3: DEEP INVESTIGATION (on-demand only) ─────────────────────────────
// Hidden until the executive requests it via interaction.
// Rendered in DetailPanel (L2) or FocusMode (L3).
// Rule: Never surface Tier 3 data in Tier 1 or Tier 2 zones.
// Cognitive load budget: HIGH — executive has chosen to investigate.

export const TIER_3 = {
  label: 'Deep Investigation',
  timeWindow: 'on-demand',
  cognitiveLoad: 'high',
  interactionRequired: true,
  trigger: {
    L2: 'single_click → DetailPanel (40% overlay)',
    L3: 'double_click → FocusMode (full screen)',
  },
  contexts: [
    {
      id: 'project_detail',
      label: 'Project Deep Dive',
      trigger: 'click on ProjectHealthCard',
      reveals: [
        'Full risk register for this project',
        'All milestones with variance history',
        'Team assignments and capacity',
        'Dependency map (blocked by / blocking)',
        'Decision log',
        'Evidence and attachments',
        'Escalation history',
        'Delivery forecast with confidence band',
      ],
      cognitiveRole: 'root_cause_investigation',
    },
    {
      id: 'risk_detail',
      label: 'Risk Investigation',
      trigger: 'click on RiskCard',
      reveals: [
        'Risk description and impact assessment',
        'Mitigation plan with owner and deadline',
        'Affected projects and dependencies',
        'Escalation path',
        'Historical risk trend',
      ],
      cognitiveRole: 'risk_deep_dive',
    },
    {
      id: 'decision_detail',
      label: 'Decision Context',
      trigger: 'click on DecisionCard',
      reveals: [
        'Decision brief and options',
        'Stakeholders required',
        'Impact if delayed',
        'Supporting evidence',
        'Recommendation from team',
      ],
      cognitiveRole: 'decision_support',
    },
    {
      id: 'focus_mode',
      label: 'Project Focus Mode',
      trigger: 'double-click on ProjectHealthCard',
      reveals: [
        'Full project command view (single project)',
        'All Tier 2 zones filtered to this project',
        'Delivery confidence trend chart',
        'Resource allocation for this project',
        'Full activity timeline',
      ],
      cognitiveRole: 'single_project_command',
    },
  ],
}

// ─── COGNITIVE RULES ─────────────────────────────────────────────────────────
// These rules govern how information is presented across all tiers.
// Components must respect these rules — they are not suggestions.

export const COGNITIVE_RULES = {
  // Rule 1: Deviation over absolute values
  // Show variance, delta, trend — not raw numbers alone.
  // "Delivery confidence: 94% ↑+2%" is more useful than "94%"
  showDeviation: true,

  // Rule 2: Severity sorting is non-negotiable
  // Red items always appear before amber. Amber before green.
  // An executive must never have to search for the worst item.
  severitySortOrder: ['critical', 'red', 'high', 'amber', 'medium', 'low', 'green'],

  // Rule 3: Actionable items are visually distinct from informational items
  // Decisions (require executive action) must look different from risks (require team action).
  actionableDistinction: true,

  // Rule 4: Data freshness is always visible
  // Stale data is worse than no data — it creates false confidence.
  dataFreshnessAlwaysVisible: true,

  // Rule 5: No information hidden inside collapsed sections by default
  // Tier 2 zones are always expanded. Collapse is only for Tier 3.
  defaultExpanded: true,

  // Rule 6: Maximum 4 items in any Tier 1 signal group
  // Cognitive science: working memory holds 4±1 items.
  // If there are more than 4 critical alerts, show "4 of N" — not all N.
  tier1MaxItems: 4,

  // Rule 7: Color is semantic, never decorative
  colorSemantics: {
    green: 'healthy | on-track | resolved',
    amber: 'at-risk | slipping | needs attention',
    red: 'critical | blocked | overdue | overloaded',
    blue: 'informational | neutral | in-progress',
  },

  // Rule 8: Z-pattern reading — critical top-left, log bottom-right
  readingPattern: 'Z-pattern: top-left (critical) → top-right (context) → bottom-left (action) → bottom-right (log)',
}

// ─── SUPPRESSION RULES ───────────────────────────────────────────────────────
// What must NEVER appear in Tier 1 or Tier 2 without executive request.

export const SUPPRESSED_UNTIL_REQUESTED = [
  'Individual task lists',
  'Sprint backlogs',
  'Code review status',
  'Meeting notes',
  'Detailed financial breakdowns',
  'Individual team member performance',
  'Technical architecture details',
  'Vendor contract terms',
  'Historical data older than 30 days (unless trending)',
  'Activity feed items older than 24 hours',
  'Resolved risks and closed decisions',
  'Green-status project internals',
]

// ─── PRIORITY SORT HELPERS ───────────────────────────────────────────────────
// Used by zone components to enforce cognitive Rule 2.

const SEVERITY_RANK = { critical: 0, red: 1, high: 2, amber: 3, medium: 4, low: 5, green: 6 }

export const bySeverity = (a, b) =>
  (SEVERITY_RANK[a.severity ?? a.status] ?? 9) - (SEVERITY_RANK[b.severity ?? b.status] ?? 9)

export const byDeadline = (a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0)

export const byVariance = (a, b) => (b.variance ?? 0) - (a.variance ?? 0)

export const byUtilization = (a, b) => (b.allocated ?? 0) - (a.allocated ?? 0)
