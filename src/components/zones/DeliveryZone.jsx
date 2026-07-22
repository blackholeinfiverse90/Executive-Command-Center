import clsx from 'clsx'
import { lazy, Suspense } from 'react'
import { ZoneShell } from './ZoneShell'
import { ForecastStat } from '../cards'

// Lazy-load the entire charts module — keeps Recharts (~700KB) out of the initial bundle.
// Charts render 200-400ms after the rest of the dashboard — acceptable for Tier 2 visualizations.
const LazyConfidenceTrendChart = lazy(() =>
  import('../charts').then((m) => ({ default: m.ConfidenceTrendChart }))
)
const LazyPortfolioDonut = lazy(() =>
  import('../charts').then((m) => ({ default: m.PortfolioDonut }))
)

function ChartSkeleton({ height }) {
  return <div className="animate-pulse bg-surface-light rounded" style={{ height }} />
}

export function DeliveryZone({ forecast, confidenceHistory, confidenceTrend }) {
  const { onTrack, atRisk, blocked, total, portfolioConfidence, confidenceDelta, projectedSlipDays } = forecast

  const deltaColor = confidenceDelta >= 0 ? 'text-green-400' : 'text-red-400'
  const deltaSign  = confidenceDelta >= 0 ? '+' : ''
  const slipColor  = projectedSlipDays === 0 ? 'green' : projectedSlipDays <= 3 ? 'amber' : 'red'

  return (
    <ZoneShell id="zone-delivery" label="Delivery Forecast">

      {/* Trend chart — 7-day confidence history */}
      {confidenceHistory?.length > 0 && (
        <div className="mb-3">
          <Suspense fallback={<ChartSkeleton height={52} />}>
            <LazyConfidenceTrendChart history={confidenceHistory} trend={confidenceTrend} />
          </Suspense>
        </div>
      )}

      {/* Portfolio donut + stats */}
      <div className="flex items-center gap-4">
        <Suspense fallback={<ChartSkeleton height={80} />}>
          <LazyPortfolioDonut onTrack={onTrack} atRisk={atRisk} blocked={blocked} total={total} />
        </Suspense>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
          <ForecastStat label="On Track" value={onTrack} color="green" />
          <ForecastStat label="At Risk"  value={atRisk}  color="amber" />
          <ForecastStat label="Blocked"  value={blocked} color="red"   />
          <ForecastStat label="Avg Slip" value={`${projectedSlipDays}d`} color={slipColor} />
        </div>
      </div>

      {/* Confidence footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-caption text-text-secondary">Portfolio Confidence</span>
        <div className="flex items-center gap-2">
          <span className="text-h2 font-semibold">{portfolioConfidence}%</span>
          <span className={clsx('text-caption font-medium', deltaColor)}>
            {deltaSign}{confidenceDelta}% this cycle
          </span>
        </div>
      </div>
    </ZoneShell>
  )
}
