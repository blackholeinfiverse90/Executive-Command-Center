import { MetricCard } from '../cards'
import { ZoneShell } from './ZoneShell'

export function ExecutiveSummary({ summary }) {
  return (
    <ZoneShell id="zone-executive-summary" label="Executive Summary">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Delivery Confidence"  value={summary.deliveryConfidence}  unit="%" trend={summary.confidenceTrend} delta={`${summary.confidenceTrend === 'up' ? '+' : ''}2%`} />
        <MetricCard label="Active Projects"      value={summary.activeProjects} />
        <MetricCard label="Critical Risks"       value={summary.criticalRisks}       trend="down" delta="+1" />
        <MetricCard label="Pending Decisions"    value={summary.pendingDecisions} />
        <MetricCard label="Resource Utilization" value={summary.resourceUtilization} unit="%" trend="up" delta="+5%" />
      </div>
    </ZoneShell>
  )
}
