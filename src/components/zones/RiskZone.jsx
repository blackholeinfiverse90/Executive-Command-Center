import { RiskCard } from '../cards'
import { bySeverity } from '../../config/informationHierarchy'
import { ZoneShell } from './ZoneShell'

export function RiskZone({ risks, onRiskClick }) {
  const sorted = [...risks].sort(bySeverity)
  const criticalCount = risks.filter((r) => r.severity === 'critical' || r.severity === 'high').length

  return (
    <ZoneShell
      id="zone-risks"
      label="Top Risks"
      badge={criticalCount > 0 ? criticalCount : null}
      badgeColor="red"
    >
      <div className="overflow-y-auto max-h-44">
        {sorted.map((r) => <RiskCard key={r.id} risk={r} onClick={onRiskClick} />)}
      </div>
    </ZoneShell>
  )
}
