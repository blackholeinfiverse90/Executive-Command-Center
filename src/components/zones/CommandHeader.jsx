import clsx from 'clsx'
import { StatusDot } from '../cards'
import { TIER_1, COGNITIVE_RULES } from '../../config/informationHierarchy'
import { LOW_SCROLL_NAVIGATION } from '../../config/uxPrinciples'
import { useCommandStore } from '../../store/commandStore'

const HEALTH_LABEL = { green: 'HEALTHY', amber: 'AT RISK', red: 'CRITICAL' }
const HEALTH_COLOR = { green: 'text-green-400', amber: 'text-amber-400', red: 'text-red-400' }

function TrendArrow({ trend }) {
  if (trend === 'up')   return <span className="text-green-400">↑</span>
  if (trend === 'down') return <span className="text-red-400">↓</span>
  return <span className="text-text-secondary">→</span>
}

// UX Principle 3: Low-scroll navigation — jump to zone by anchor id
function jumpToZone(anchorId) {
  document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * CommandHeader — Tier 1 Cognition Zone
 *
 * UX additions in Phase 4:
 *   - Refresh pulse (green border flash when data updates)
 *   - Stale warning (timestamp turns amber if data > 2min old)
 *   - Zone-jump shortcuts (1–7 keys, shown on ? press)
 *   - Keyboard shortcut toggle button
 */
export function CommandHeader({ health, alertCount, lastUpdated, deliveryConfidence, confidenceTrend }) {
  const { isRefreshPulsing, lastRefreshed, toggleShortcuts } = useCommandStore()

  const displayCount = Math.min(alertCount, COGNITIVE_RULES.tier1MaxItems)
  const isCapped     = alertCount > COGNITIVE_RULES.tier1MaxItems

  // UX Principle 9: stale warning — amber timestamp if data > 2 minutes old
  const isStale = lastRefreshed
    ? (Date.now() - lastRefreshed.getTime()) > 120_000
    : false

  return (
    <header
      className={clsx(
        'h-14 bg-surface-mid border-b border-border flex items-center justify-between px-6 flex-shrink-0 transition-all',
        isRefreshPulsing && 'refresh-pulse'
      )}
    >
      {/* Identity + zone jump hints */}
      <div className="flex items-center gap-4">
        <span className="text-body font-semibold tracking-wide">BHIV COMMAND CENTER</span>
        {/* UX Principle 3: zone anchors — click to jump */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Zone navigation">
          {Object.entries(LOW_SCROLL_NAVIGATION.zoneAnchors).map(([key, id]) => {
            const labels = { '1':'KPIs','2':'Alerts','3':'Projects','4':'Risks','5':'Timeline','6':'Decisions','7':'Blockers' }
            return (
              <button
                key={key}
                onClick={() => jumpToZone(id)}
                className="text-micro text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded hover:bg-surface-light transition-colors"
                title={`Jump to ${labels[key]} (press ${key})`}
              >
                {labels[key]}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tier 1 signals */}
      <div className="flex items-center gap-5">

        {/* Signal 4 — Trust: data freshness with stale warning */}
        <span
          className={clsx('text-caption', isStale ? 'text-amber-400' : 'text-text-secondary')}
          title={isStale ? 'Data may be stale — refresh pending' : TIER_1.signals[3].cognitiveRole}
        >
          {isStale ? '⚠ ' : ''}Updated {lastUpdated}
        </span>

        {/* Signal 3 — Trajectory: delivery confidence + trend */}
        {deliveryConfidence != null && (
          <div className="flex items-center gap-1 text-caption" title={TIER_1.signals[2].cognitiveRole}>
            <span className="text-text-secondary">Confidence</span>
            <span className="font-semibold text-text-primary">{deliveryConfidence}%</span>
            <TrendArrow trend={confidenceTrend} />
          </div>
        )}

        {/* Signal 1 — Orientation: overall health */}
        <div className="flex items-center gap-2" title={TIER_1.signals[0].cognitiveRole}>
          <StatusDot status={health} size="lg" />
          <span className={clsx('text-body font-semibold', HEALTH_COLOR[health])}>
            {HEALTH_LABEL[health]}
          </span>
        </div>

        {/* Signal 2 — Urgency: alert count badge */}
        {alertCount > 0 && (
          <button
            className="flex items-center gap-1.5 bg-red-900 text-red-300 px-3 py-1 rounded text-caption font-semibold hover:bg-red-800 transition-colors"
            onClick={() => jumpToZone('zone-alerts')}
            title="Jump to Alerts zone"
          >
            🔔 {isCapped ? `${displayCount} of ${alertCount}` : displayCount} ALERTS
          </button>
        )}

        {/* UX Principle 10: keyboard shortcut toggle */}
        <button
          onClick={toggleShortcuts}
          className="text-micro text-text-secondary hover:text-text-primary px-2 py-1 rounded border border-border hover:border-text-secondary transition-colors"
          title="Show keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
        >
          ?
        </button>

      </div>
    </header>
  )
}
