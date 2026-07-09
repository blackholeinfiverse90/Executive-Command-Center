/**
 * PHASE 3 — REUSABLE COMPONENT SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is the component catalogue for the Executive Command Center.
 *
 * It defines every component's:
 *   - Identity (id, name, file location)
 *   - Tier membership (which information tier it belongs to)
 *   - Cognitive role (what executive question it answers)
 *   - Props contract (what it accepts, types, required vs optional)
 *   - Data shape (what object structure it expects)
 *   - Interaction model (what it does on click, hover, keyboard)
 *   - Constraints (what it must never do)
 *   - Zone membership (which zone(s) it lives in)
 *
 * Rule: Every component in cards/index.jsx must have an entry here.
 * Rule: No component may be built without a catalogue entry first.
 * Rule: Props not listed here must not be added without updating this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── LAYER 0: PRIMITIVE ATOMS ─────────────────────────────────────────────────
// Not cards. Not zones. The smallest visual units used inside cards.

export const PRIMITIVES = {
  StatusDot: {
    id: 'StatusDot',
    description: 'Colored circle encoding health/severity as a pre-attentive signal.',
    tier: 'all',
    cognitiveRole: 'pre-attentive color signal — orientation before reading',
    props: {
      status: {
        type: "'green' | 'amber' | 'red' | 'critical' | 'high' | 'medium' | 'low'",
        required: true,
        semantics: 'Maps to COGNITIVE_RULES.colorSemantics — never use for decoration',
      },
      size: {
        type: "'sm' | 'lg'",
        required: false,
        default: "'sm'",
      },
    },
    constraints: [
      'Color must always map to colorSemantics — never arbitrary',
      'Must include aria-label for screen readers',
      'Never use as a decorative element',
    ],
  },

  TrendArrow: {
    id: 'TrendArrow',
    description: 'Direction indicator showing whether a metric is improving or degrading.',
    tier: 1,
    cognitiveRole: 'trajectory signal — direction matters more than absolute value',
    props: {
      trend: {
        type: "'up' | 'down' | 'flat'",
        required: true,
      },
    },
    constraints: [
      'Up is always green. Down is always red. Flat is always neutral.',
      'Never invert semantics (e.g. down = good for risk count)',
      'For metrics where down is good (e.g. risk count), caller must invert the trend value',
    ],
  },
}

// ─── LAYER 1: TIER 1 COMPONENTS ───────────────────────────────────────────────
// Live in CommandHeader. Zero interaction required. Maximum cognitive efficiency.

export const TIER_1_COMPONENTS = {
  MetricCard: {
    id: 'MetricCard',
    description: 'Executive KPI card. Shows a single metric with label, value, unit, and trend.',
    tier: 1,
    zone: 'ExecutiveSummary',
    cognitiveRole: 'portfolio KPI — single number with direction signal',
    props: {
      label:  { type: 'string',  required: true,  description: 'Short uppercase label, e.g. "Delivery Confidence"' },
      value:  { type: 'number | string', required: true, description: 'The primary metric value' },
      unit:   { type: 'string',  required: false, description: 'Unit suffix, e.g. "%" or "days"' },
      trend:  { type: "'up' | 'down' | 'flat'", required: false, description: 'Direction since last period' },
      delta:  { type: 'string',  required: false, description: 'Human-readable change, e.g. "+2%" or "+1"' },
      status: { type: "'green' | 'amber' | 'red'", required: false, description: 'Optional border accent for threshold breach' },
    },
    dataShape: {
      // Sourced from: data.summary
      example: { label: 'Delivery Confidence', value: 94, unit: '%', trend: 'up', delta: '+2%', status: 'green' },
    },
    interaction: {
      click: null,  // Tier 1 — no interaction. Executive reads, does not click.
      hover: 'none',
    },
    constraints: [
      'Must show trend arrow when trend prop is provided',
      'Must show delta when delta prop is provided',
      'No click handler — Tier 1 components are read-only',
      'Value must be a single scannable number — no sentences',
      'Label must be ≤ 3 words',
    ],
  },
}

// ─── LAYER 2: TIER 2 COMPONENTS ───────────────────────────────────────────────
// Live in zone bodies. Always visible. Pattern recognition, not reading.

export const TIER_2_COMPONENTS = {
  ProjectHealthCard: {
    id: 'ProjectHealthCard',
    description: 'Project status card with color-coded left border, progress bar, owner, and next milestone.',
    tier: 2,
    zone: 'ProjectHealthGrid',
    cognitiveRole: 'portfolio scan — status color + progress bar readable in <1s per card',
    props: {
      project:       { type: 'ProjectShape', required: true },
      onClick:       { type: 'function',     required: false, description: 'Opens L2 DetailPanel' },
      onDoubleClick: { type: 'function',     required: false, description: 'Enters L3 FocusMode' },
    },
    dataShape: {
      // Sourced from: data.projects[]
      ProjectShape: {
        id:              'string',
        name:            'string',
        status:          "'green' | 'amber' | 'red'",
        progress:        'number (0–100)',
        nextMilestone:   'string',
        owner:           'string',
        lastUpdated:     'string (HH:MM)',
      },
    },
    interaction: {
      click:       'openPanel("project", project.id) → L2 DetailPanel',
      doubleClick: 'enterFocus(project.id) → L3 FocusMode',
      keyboard:    'Enter = click, Space = click',
      hover:       'bg-surface-light highlight',
    },
    constraints: [
      'Left border color must always reflect project.status — never hardcoded',
      'Progress bar color must match status color',
      'Must be keyboard accessible (tabIndex, role=button)',
      'Name must truncate — never wrap to second line in grid layout',
      'Must show "BLOCKED" visually distinct when nextMilestone === "BLOCKED"',
    ],
  },

  AlertCard: {
    id: 'AlertCard',
    description: 'Alert row with severity-colored left border, title, timestamp, and SLA countdown.',
    tier: 2,
    zone: 'AlertsZone',
    cognitiveRole: 'threat identification — severity color + SLA remaining = urgency at a glance',
    props: {
      alert:   { type: 'AlertShape', required: true },
      onClick: { type: 'function',   required: false, description: 'Opens L2 DetailPanel for this alert' },
    },
    dataShape: {
      AlertShape: {
        id:           'string',
        severity:     "'critical' | 'high' | 'medium' | 'low'",
        title:        'string',
        time:         'string (HH:MM)',
        slaRemaining: 'string (e.g. "2h", "1d")',
      },
    },
    interaction: {
      click:   'openPanel("alert", alert.id) → L2 DetailPanel',
      hover:   'bg-surface-light highlight',
      keyboard: 'Enter = click',
    },
    constraints: [
      'Border color must map to severity — never status',
      'SLA remaining must always be visible — it is the urgency signal',
      'Critical alerts must be visually heavier than high alerts',
      'Never show resolved alerts in Tier 2',
    ],
  },

  RiskCard: {
    id: 'RiskCard',
    description: 'Risk row with severity dot, title, project/owner, and mitigation status.',
    tier: 2,
    zone: 'RiskZone',
    cognitiveRole: 'threat assessment — severity + mitigation status = risk posture at a glance',
    props: {
      risk:    { type: 'RiskShape', required: true },
      onClick: { type: 'function',  required: false, description: 'Opens L2 DetailPanel for this risk' },
    },
    dataShape: {
      RiskShape: {
        id:         'string',
        title:      'string',
        severity:   "'critical' | 'high' | 'medium' | 'low'",
        project:    'string',
        owner:      'string',
        mitigation: "'In progress' | 'Pending' | 'Planned' | 'Scheduled' | 'None'",
      },
    },
    interaction: {
      click:   'openPanel("risk", risk.id) → L2 DetailPanel',
      hover:   'bg-surface-light highlight',
      keyboard: 'Enter = click',
    },
    constraints: [
      'Mitigation status must always be visible — "Pending" is a warning signal',
      'Must be clickable — risks without owners need escalation paths',
      'Never show resolved risks in Tier 2',
    ],
  },

  ResourceBar: {
    id: 'ResourceBar',
    description: 'Horizontal utilization bar for a single team. Color encodes health threshold.',
    tier: 2,
    zone: 'ResourceZone',
    cognitiveRole: 'capacity scan — bar length + color = utilization health in <0.5s',
    props: {
      resource: { type: 'ResourceShape', required: true },
    },
    dataShape: {
      ResourceShape: {
        team:      'string',
        allocated: 'number (0–110+, can exceed 100 for overload)',
        available: 'number',
        overload:  'boolean',
      },
    },
    interaction: {
      click: null,  // Informational — no drill-down at bar level
      hover: 'tooltip with exact % and available capacity',
    },
    thresholds: {
      green: 'allocated < 85',
      amber: 'allocated >= 85 && !overload',
      red:   'overload === true (allocated > 100)',
    },
    constraints: [
      'Bar must cap visual width at 100% even if allocated > 100',
      'Overload indicator (⚠) must appear when overload === true',
      'Never show available capacity as a separate bar — one bar, one truth',
    ],
  },

  MilestoneRow: {
    id: 'MilestoneRow',
    description: 'Timeline table row showing project, milestone name, forecast date, and variance.',
    tier: 2,
    zone: 'TimelineZone',
    cognitiveRole: 'schedule health — variance column is the only number that matters',
    props: {
      milestone: { type: 'MilestoneShape', required: true },
    },
    dataShape: {
      MilestoneShape: {
        id:       'string',
        project:  'string',
        name:     'string',
        planned:  'string (MMM DD)',
        forecast: 'string (MMM DD)',
        variance: 'number (days, 0 = on track, positive = slipping)',
        status:   "'on-track' | 'slipping' | 'at-risk' | 'blocked'",
      },
    },
    interaction: {
      click: null,
    },
    constraints: [
      'Variance column must use color: green=0, amber=1–7, red=>7',
      'Must use CSS grid matching TimelineZone header — columns must align',
      'Show "+Nd" for positive variance, status label for zero variance',
      'Never show planned date — only forecast and variance matter',
    ],
  },

  DecisionCard: {
    id: 'DecisionCard',
    description: 'Decision row with title, owner, deadline, and overdue/days-left badge.',
    tier: 2,
    zone: 'DecisionZone',
    cognitiveRole: 'action required — overdue badge is the executive accountability signal',
    props: {
      decision: { type: 'DecisionShape', required: true },
      onClick:  { type: 'function',      required: false, description: 'Opens L2 DetailPanel for this decision' },
    },
    dataShape: {
      DecisionShape: {
        id:       'string',
        title:    'string',
        deadline: 'string (MMM DD)',
        owner:    'string',
        status:   "'overdue' | 'pending' | 'resolved'",
        daysLeft: 'number (negative = overdue)',
      },
    },
    interaction: {
      click:   'openPanel("decision", decision.id) → L2 DetailPanel',
      hover:   'bg-surface-light highlight',
      keyboard: 'Enter = click',
    },
    constraints: [
      'Overdue decisions must render title in red — executive accountability',
      'OVERDUE badge must be visually distinct from days-left badge',
      'Must be clickable — decisions need context before action',
      'Never show resolved decisions in Tier 2',
    ],
  },

  DependencyCard: {
    id: 'DependencyCard',
    description: 'Dependency row showing which project is blocking which, reason, and duration.',
    tier: 2,
    zone: 'DependencyZone',
    cognitiveRole: 'blocker visibility — direction arrow makes the blocking relationship scannable',
    props: {
      dep:     { type: 'DependencyShape', required: true },
      onClick: { type: 'function',        required: false, description: 'Opens L2 DetailPanel for this dependency' },
    },
    dataShape: {
      DependencyShape: {
        id:       'string',
        from:     'string (project being blocked)',
        to:       'string (project causing the block)',
        type:     "'blocked-by' | 'waiting-on'",
        reason:   'string',
        severity: "'critical' | 'high' | 'medium'",
        since:    'string (e.g. "2d", "4h")',
      },
    },
    interaction: {
      click:   'openPanel("dependency", dep.id) → L2 DetailPanel',
      hover:   'bg-surface-light highlight',
    },
    constraints: [
      'Direction must always be explicit: FROM blocked BY TO',
      '"blocked-by" must render in red, "waiting-on" in amber',
      'Duration (since) must always be visible — age of a blocker matters',
    ],
  },

  ForecastStat: {
    id: 'ForecastStat',
    description: 'Single large-number stat used inside DeliveryZone for portfolio counts.',
    tier: 2,
    zone: 'DeliveryZone',
    cognitiveRole: 'portfolio count — large number + color = instant portfolio health read',
    props: {
      label: { type: 'string',                          required: true },
      value: { type: 'number | string',                 required: true },
      color: { type: "'green' | 'amber' | 'red' | 'default'", required: false },
    },
    interaction: { click: null },
    constraints: [
      'Value must be a single number or short string — no sentences',
      'Color must map to colorSemantics',
      'Label must be ≤ 2 words',
    ],
  },

  ActivityItem: {
    id: 'ActivityItem',
    description: 'Single activity log entry: timestamp, actor, action verb, entity.',
    tier: 2,
    zone: 'ActivityFeed',
    cognitiveRole: 'operational log — who did what to which project, when',
    props: {
      item: { type: 'ActivityShape', required: true },
    },
    dataShape: {
      ActivityShape: {
        id:     'string',
        actor:  'string',
        action: 'string (verb phrase, e.g. "closed sprint")',
        entity: 'string (project name)',
        time:   'string (HH:MM)',
      },
    },
    interaction: { click: null },
    constraints: [
      'Actor name in primary color, action in secondary, entity in blue',
      'Time must always be leftmost — scanning the log is time-based',
      'Never show items older than 24h in Tier 2 (suppression rule)',
      'Action must be a past-tense verb phrase — not a noun',
    ],
  },
}

// ─── LAYER 3: TIER 3 COMPONENTS ───────────────────────────────────────────────
// Live in DetailPanel (L2) and FocusMode (L3). On-demand only.
// These components reveal information suppressed from Tier 1 and Tier 2.

export const TIER_3_COMPONENTS = {
  EscalationCard: {
    id: 'EscalationCard',
    description: 'Escalation record showing what was escalated, by whom, to whom, and current status.',
    tier: 3,
    zone: 'DetailPanel (L2)',
    cognitiveRole: 'escalation trail — who raised it, who owns resolution, how long it has been open',
    props: {
      escalation: { type: 'EscalationShape', required: true },
      onClick:    { type: 'function',         required: false },
    },
    dataShape: {
      EscalationShape: {
        id:          'string',
        title:       'string',
        raisedBy:    'string',
        raisedTo:    'string',
        project:     'string',
        status:      "'open' | 'acknowledged' | 'resolved'",
        raisedAt:    'string (HH:MM or date)',
        daysOpen:    'number',
        description: 'string',
      },
    },
    interaction: {
      click: 'expand inline to show full description',
      hover: 'bg-surface-light highlight',
    },
    constraints: [
      'daysOpen must always be visible — age of an escalation is a governance signal',
      'Status badge: open=red, acknowledged=amber, resolved=green',
      'Never surface in Tier 1 or Tier 2 — escalation detail is Tier 3 only',
      'raisedTo must be visible — accountability requires a named owner',
    ],
  },

  EvidenceCard: {
    id: 'EvidenceCard',
    description: 'Evidence attachment card: document title, type, uploaded by, and date.',
    tier: 3,
    zone: 'DetailPanel (L2)',
    cognitiveRole: 'evidence trail — supports decisions and risk assessments with linked proof',
    props: {
      evidence: { type: 'EvidenceShape', required: true },
      onClick:  { type: 'function',      required: false, description: 'Opens or downloads the evidence' },
    },
    dataShape: {
      EvidenceShape: {
        id:         'string',
        title:      'string',
        type:       "'document' | 'report' | 'screenshot' | 'link' | 'data'",
        uploadedBy: 'string',
        uploadedAt: 'string (date)',
        url:        'string (optional — for link type)',
      },
    },
    interaction: {
      click: 'open/download evidence item',
      hover: 'bg-surface-light highlight',
    },
    constraints: [
      'Type icon must distinguish document from link from data',
      'Never render raw URLs — always show title',
      'Must show who uploaded and when — provenance matters for executive decisions',
      'Never surface in Tier 1 or Tier 2',
    ],
  },
}

// ─── COMPONENT CATALOGUE SUMMARY ─────────────────────────────────────────────
// Quick reference: component → tier → zone → interaction

export const CATALOGUE_SUMMARY = [
  // Primitives
  { component: 'StatusDot',        tier: 'all', zone: 'all',              interaction: 'none'   },
  { component: 'TrendArrow',       tier: 1,     zone: 'CommandHeader',    interaction: 'none'   },

  // Tier 1
  { component: 'MetricCard',       tier: 1,     zone: 'ExecutiveSummary', interaction: 'none'   },

  // Tier 2
  { component: 'ProjectHealthCard',tier: 2,     zone: 'ProjectHealthGrid',interaction: 'click → L2, dblclick → L3' },
  { component: 'AlertCard',        tier: 2,     zone: 'AlertsZone',       interaction: 'click → L2' },
  { component: 'RiskCard',         tier: 2,     zone: 'RiskZone',         interaction: 'click → L2' },
  { component: 'ResourceBar',      tier: 2,     zone: 'ResourceZone',     interaction: 'hover tooltip' },
  { component: 'MilestoneRow',     tier: 2,     zone: 'TimelineZone',     interaction: 'none'   },
  { component: 'DecisionCard',     tier: 2,     zone: 'DecisionZone',     interaction: 'click → L2' },
  { component: 'DependencyCard',   tier: 2,     zone: 'DependencyZone',   interaction: 'click → L2' },
  { component: 'ForecastStat',     tier: 2,     zone: 'DeliveryZone',     interaction: 'none'   },
  { component: 'ActivityItem',     tier: 2,     zone: 'ActivityFeed',     interaction: 'none'   },

  // Tier 3
  { component: 'EscalationCard',   tier: 3,     zone: 'DetailPanel',      interaction: 'click expand' },
  { component: 'EvidenceCard',     tier: 3,     zone: 'DetailPanel',      interaction: 'click open'   },
]
