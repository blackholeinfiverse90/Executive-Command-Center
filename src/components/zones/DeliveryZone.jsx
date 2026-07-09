import clsx from 'clsx'
import { ZoneShell } from './ZoneShell'
import { ForecastStat } from '../cards'
import { ConfidenceTrendChart, PortfolioDonut } from '../charts'

export function DeliveryZone({ forecast, confidenceHistory, confidenceTrend }) {
  const { onTrack, atRisk, blocked, total, portfolioConfidence, confidenceDelta, projectedSlipDays } = forecast

  const deltaColor = confidenceDelta >= 0 ? 'text-green-400' : 'text-red-400'
  const deltaSign  = confidenceDelta >= 0 ? '+' : ''
  const slipColor  = projectedSlipDays === 0 ? 'green' : projectedSlipDays <= 3 ? 'amber' : 'red'

  return (
    <ZoneShell id="zone-delivery" label="Delivery Forecast">

      {/* Trend chart — 7-day confidence history */}
      {/* Visualization: TREND_STRATEGY — shape shows direction, not just current value */}
      {confidenceHistory?.length > 0 && (
        <div className="mb-3">
          <ConfidenceTrendChart history={confidenceHistory} trend={confidenceTrend} />
        </div>
      )}

      {/* Portfolio donut + stats side by side */}
      {/* Visualization: PROGRESS_STRATEGY — donut shows part-to-whole health split */}
      <div className="flex items-center gap-4">
        <PortfolioDonut onTrack={onTrack} atRisk={atRisk} blocked={blocked} total={total} />
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
