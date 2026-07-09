import { AlertCard } from '../cards'
import { bySeverity } from '../../config/informationHierarchy'
import { ZoneShell } from './ZoneShell'

export function AlertsZone({ alerts, onAlertClick }) {
  const sorted = [...alerts].sort(bySeverity)
  const criticalCount = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length

  return (
    <ZoneShell
      id="zone-alerts"
      label="Alerts & Escalations"
      badge={criticalCount > 0 ? criticalCount : null}
      badgeColor="red"
    >
      <div className="flex flex-col gap-2 overflow-y-auto max-h-56">
        {sorted.map((a) => (
          <AlertCard key={a.id} alert={a} onClick={onAlertClick} />
        ))}
      </div>
    </ZoneShell>
  )
}
