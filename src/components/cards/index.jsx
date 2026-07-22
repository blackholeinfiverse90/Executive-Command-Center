/**
 * Component Library — Executive Command Center
 * Every component here has a contract defined in src/config/componentCatalogue.js
 * Do not add props or change behavior without updating the catalogue first.
 */
import { memo } from 'react'
import clsx from 'clsx'

// ─── SHARED LOOKUP TABLES ─────────────────────────────────────────────────────
// Single source of truth for color mappings used across all components.
// Changing a color here changes it everywhere — intentional.

const DOT_COLOR = {
  green:    'bg-status-green',
  amber:    'bg-status-amber',
  red:      'bg-status-red',
  critical: 'bg-status-red',
  high:     'bg-status-amber',
  medium:   'bg-yellow-500',
  low:      'bg-blue-500',
}

const BORDER_LEFT_COLOR = {
  green:    'border-status-green',
  amber:    'border-status-amber',
  red:      'border-status-red',
  critical: 'border-status-red',
  high:     'border-status-amber',
}

const TEXT_SEVERITY_COLOR = {
  critical: 'text-red-400',
  high:     'text-amber-400',
  medium:   'text-yellow-400',
  low:      'text-blue-400',
  green:    'text-green-400',
  amber:    'text-amber-400',
  red:      'text-red-400',
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

/**
 * StatusDot — pre-attentive color signal.
 * Catalogue: PRIMITIVES.StatusDot
 */
export function StatusDot({ status, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
  return (
    <span
      className={clsx('inline-block rounded-full flex-shrink-0', sz, DOT_COLOR[status] ?? 'bg-gray-500')}
      aria-label={status}
    />
  )
}

// ─── TIER 1 COMPONENTS ────────────────────────────────────────────────────────

/**
 * MetricCard — executive KPI card.
 * Catalogue: TIER_1_COMPONENTS.MetricCard
 * Fix: removed unused `status` border — MetricCards are read-only, no status border needed.
 * Fix: trend arrow color now correctly inverts for risk/negative metrics via caller passing trend.
 */
export function MetricCard({ label, value, unit, trend, delta }) {
  const trendIcon  = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
  return (
    <div className="bg-surface-light border border-border rounded p-4 flex flex-col gap-1">
      <span className="text-micro text-text-secondary uppercase tracking-widest">{label}</span>
      <div className="flex items-end gap-1.5">
        <span className="text-display leading-none font-bold">{value}</span>
        {unit && <span className="text-body text-text-secondary mb-1">{unit}</span>}
      </div>
      {(trendIcon || delta) && (
        <span className={clsx('text-caption flex items-center gap-1', trendColor)}>
          {trendIcon && <span>{trendIcon}</span>}
          {delta && <span>{delta}</span>}
        </span>
      )}
    </div>
  )
}

// ─── TIER 2 COMPONENTS ────────────────────────────────────────────────────────

/**
 * ProjectHealthCard — project status card.
 * Catalogue: TIER_2_COMPONENTS.ProjectHealthCard
 * Constraint: "BLOCKED" nextMilestone renders visually distinct in red.
 */
export const ProjectHealthCard = memo(function ProjectHealthCard({ project, onClick, onDoubleClick }) {
  const isBlocked = project.nextMilestone === 'BLOCKED'
  return (
    <div
      className={clsx(
        'bg-surface-dark border-l-4 rounded p-4 cursor-pointer hover:bg-surface-light transition-colors',
        BORDER_LEFT_COLOR[project.status] ?? 'border-gray-500'
      )}
      onClick={() => onClick?.(project)}
      onDoubleClick={() => onDoubleClick?.(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(project) }}
      aria-label={`${project.name} — ${project.status}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-body font-semibold truncate">{project.name}</span>
        <StatusDot status={project.status} size="lg" />
      </div>
      <div className="w-full bg-surface-mid rounded-full h-1.5 mb-2">
        <div
          className={clsx('h-1.5 rounded-full transition-all', DOT_COLOR[project.status])}
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <div className="flex justify-between text-caption text-text-secondary">
        <span>{project.progress}%</span>
        <span className="truncate ml-2">{project.owner}</span>
      </div>
      <div className={clsx('text-caption mt-1 truncate', isBlocked ? 'text-red-400 font-semibold' : 'text-text-secondary')}>
        {isBlocked ? '⊘ BLOCKED' : `→ ${project.nextMilestone}`}
      </div>
    </div>
  )
}
)

/**
 * AlertCard — alert row with severity border and SLA countdown.
 * Catalogue: TIER_2_COMPONENTS.AlertCard
 */
export const AlertCard = memo(function AlertCard({ alert, onClick }) {
  const borderText = {
    critical: 'border-status-red',
    high:     'border-status-amber',
    medium:   'border-yellow-500',
    low:      'border-blue-500',
  }
  return (
    <div
      className={clsx(
        'border-l-2 pl-3 py-2 cursor-pointer hover:bg-surface-light rounded-r transition-colors',
        borderText[alert.severity]
      )}
      onClick={() => onClick?.(alert)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(alert) }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={clsx('text-body leading-snug', TEXT_SEVERITY_COLOR[alert.severity])}>
          {alert.title}
        </span>
        <span className="text-micro text-text-secondary flex-shrink-0 mt-0.5">
          SLA: {alert.slaRemaining}
        </span>
      </div>
      <div className="text-caption text-text-secondary mt-0.5">{alert.time}</div>
    </div>
  )
}
)

/**
 * RiskCard — risk row with severity dot, title, project/owner, mitigation status.
 * Catalogue: TIER_2_COMPONENTS.RiskCard
 * Fix: added onClick — risks must be clickable to open L2 detail.
 * Fix: mitigation "Pending" now renders in amber as a warning signal.
 */
export const RiskCard = memo(function RiskCard({ risk, onClick }) {
  const mitigationColor = risk.mitigation === 'Pending' || risk.mitigation === 'None'
    ? 'text-amber-400'
    : 'text-text-secondary'
  return (
    <div
      className={clsx(
        'flex items-start gap-3 py-2 border-b border-border last:border-0',
        onClick && 'cursor-pointer hover:bg-surface-light rounded transition-colors'
      )}
      onClick={() => onClick?.(risk)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(risk) }}
    >
      <StatusDot status={risk.severity} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="text-body truncate">{risk.title}</div>
        <div className="text-caption text-text-secondary">{risk.project} · {risk.owner}</div>
      </div>
      <span className={clsx('text-micro flex-shrink-0', mitigationColor)}>{risk.mitigation}</span>
    </div>
  )
}
)

/**
 * ResourceBar — team utilization bar.
 * Catalogue: TIER_2_COMPONENTS.ResourceBar
 * Constraint: bar caps at 100% visual width even if allocated > 100.
 */
export function ResourceBar({ resource }) {
  const pct      = Math.min(resource.allocated, 100)
  const barColor = resource.overload
    ? 'bg-status-red'
    : resource.allocated >= 85
      ? 'bg-status-amber'
      : 'bg-status-green'
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-caption text-text-secondary w-20 flex-shrink-0">{resource.team}</span>
      <div className="flex-1 bg-surface-dark rounded-full h-2">
        <div className={clsx('h-2 rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className={clsx('text-caption w-12 text-right flex-shrink-0', resource.overload ? 'text-red-400 font-semibold' : 'text-text-secondary')}>
        {resource.allocated}%{resource.overload ? ' ⚠' : ''}
      </span>
    </div>
  )
}

/**
 * MilestoneRow — timeline table row.
 * Catalogue: TIER_2_COMPONENTS.MilestoneRow
 * Fix: variance color now uses threshold: 0=green, 1–7=amber, >7=red.
 * Fix: uses CSS grid matching TimelineZone header columns exactly.
 */
export function MilestoneRow({ milestone }) {
  const varianceColor =
    milestone.variance === 0   ? 'text-green-400' :
    milestone.variance <= 7    ? 'text-amber-400' :
                                 'text-red-400'
  const statusLabel = {
    'on-track': 'on track',
    'slipping': 'slipping',
    'at-risk':  'at risk',
    'blocked':  'blocked',
  }
  return (
    <div className="grid grid-cols-[7rem_1fr_5rem_5rem] items-center gap-3 py-1.5 border-b border-border last:border-0 text-caption">
      <span className="text-text-secondary truncate">{milestone.project}</span>
      <span className="truncate">{milestone.name}</span>
      <span className="text-text-secondary">{milestone.forecast}</span>
      <span className={clsx('text-right font-medium', varianceColor)}>
        {milestone.variance > 0 ? `+${milestone.variance}d` : statusLabel[milestone.status]}
      </span>
    </div>
  )
}

/**
 * DecisionCard — decision row with overdue badge.
 * Catalogue: TIER_2_COMPONENTS.DecisionCard
 * Fix: added onClick — decisions must be clickable to open L2 context.
 */
export function DecisionCard({ decision, onClick }) {
  const isOverdue = decision.status === 'overdue'
  return (
    <div
      className={clsx(
        'flex items-center gap-3 py-2 border-b border-border last:border-0',
        onClick && 'cursor-pointer hover:bg-surface-light rounded transition-colors'
      )}
      onClick={() => onClick?.(decision)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(decision) }}
    >
      <div className="flex-1 min-w-0">
        <div className={clsx('text-body truncate', isOverdue ? 'text-red-400 font-semibold' : 'text-text-primary')}>
          {decision.title}
        </div>
        <div className="text-caption text-text-secondary">{decision.owner} · Due {decision.deadline}</div>
      </div>
      <span className={clsx(
        'text-micro flex-shrink-0 px-2 py-0.5 rounded font-semibold',
        isOverdue ? 'bg-red-900 text-red-300' : 'bg-surface-dark text-text-secondary'
      )}>
        {isOverdue ? 'OVERDUE' : `${decision.daysLeft}d left`}
      </span>
    </div>
  )
}

/**
 * DependencyCard — cross-project blocker row.
 * Catalogue: TIER_2_COMPONENTS.DependencyCard
 * Fix: added onClick for L2 drill-down.
 */
const DEP_LABEL = { 'blocked-by': 'BLOCKED BY', 'waiting-on': 'WAITING ON' }
const DEP_COLOR = { 'blocked-by': 'text-red-400', 'waiting-on': 'text-amber-400' }

export function DependencyCard({ dep, onClick }) {
  return (
    <div
      className={clsx(
        'flex items-start gap-3 py-2 border-b border-border last:border-0',
        onClick && 'cursor-pointer hover:bg-surface-light rounded transition-colors'
      )}
      onClick={() => onClick?.(dep)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <StatusDot status={dep.severity} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap text-body">
          <span className="text-text-primary font-medium truncate">{dep.from}</span>
          <span className={clsx('text-micro font-bold tracking-wide', DEP_COLOR[dep.type])}>
            {DEP_LABEL[dep.type]}
          </span>
          <span className="text-text-secondary truncate">{dep.to}</span>
        </div>
        <div className="text-caption text-text-secondary mt-0.5">{dep.reason}</div>
      </div>
      <span className="text-micro text-text-secondary flex-shrink-0 whitespace-nowrap">{dep.since} ago</span>
    </div>
  )
}

/**
 * ForecastStat — large number stat for DeliveryZone.
 * Catalogue: TIER_2_COMPONENTS.ForecastStat
 */
export function ForecastStat({ label, value, color }) {
  const colorClass = {
    green:   'text-green-400',
    amber:   'text-amber-400',
    red:     'text-red-400',
    default: 'text-text-primary',
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={clsx('text-display font-bold leading-none', colorClass[color] ?? colorClass.default)}>
        {value}
      </span>
      <span className="text-micro text-text-secondary uppercase tracking-wide text-center">{label}</span>
    </div>
  )
}

/**
 * ActivityItem — single activity log entry.
 * Catalogue: TIER_2_COMPONENTS.ActivityItem
 */
export function ActivityItem({ item }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
      <span className="text-caption text-text-secondary w-12 flex-shrink-0">{item.time}</span>
      <span className="text-caption">
        <span className="text-text-primary">{item.actor}</span>
        <span className="text-text-secondary"> {item.action} </span>
        <span className="text-blue-400">{item.entity}</span>
      </span>
    </div>
  )
}

// ─── TIER 3 COMPONENTS ────────────────────────────────────────────────────────
// Only rendered inside DetailPanel (L2) or FocusMode (L3).
// Never surface these in Tier 1 or Tier 2 zones.

/**
 * EscalationCard — escalation record for DetailPanel.
 * Catalogue: TIER_3_COMPONENTS.EscalationCard
 */
const ESC_STATUS_STYLE = {
  open:         'bg-red-900 text-red-300',
  acknowledged: 'bg-amber-900 text-amber-300',
  resolved:     'bg-green-900 text-green-300',
}

export function EscalationCard({ escalation, onClick }) {
  return (
    <div
      className={clsx(
        'flex items-start gap-3 py-2.5 border-b border-border last:border-0',
        onClick && 'cursor-pointer hover:bg-surface-light rounded transition-colors'
      )}
      onClick={() => onClick?.(escalation)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-body font-medium truncate">{escalation.title}</span>
          <span className={clsx('text-micro px-1.5 py-0.5 rounded font-semibold', ESC_STATUS_STYLE[escalation.status])}>
            {escalation.status.toUpperCase()}
          </span>
        </div>
        <div className="text-caption text-text-secondary">
          {escalation.raisedBy} → {escalation.raisedTo} · {escalation.daysOpen}d open
        </div>
        {escalation.description && (
          <div className="text-caption text-text-secondary mt-1 line-clamp-2">{escalation.description}</div>
        )}
      </div>
    </div>
  )
}

/**
 * EvidenceCard — evidence attachment for DetailPanel.
 * Catalogue: TIER_3_COMPONENTS.EvidenceCard
 */
const EVIDENCE_ICON = {
  document:   '📄',
  report:     '📊',
  screenshot: '🖼',
  link:       '🔗',
  data:       '📦',
}

export function EvidenceCard({ evidence, onClick }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 py-2 border-b border-border last:border-0',
        onClick && 'cursor-pointer hover:bg-surface-light rounded transition-colors'
      )}
      onClick={() => onClick?.(evidence)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="text-body flex-shrink-0">{EVIDENCE_ICON[evidence.type] ?? '📎'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-body truncate">{evidence.title}</div>
        <div className="text-caption text-text-secondary">{evidence.uploadedBy} · {evidence.uploadedAt}</div>
      </div>
      <span className="text-micro text-text-secondary uppercase flex-shrink-0">{evidence.type}</span>
    </div>
  )
}
