import { DecisionCard } from '../cards'
import { byDeadline } from '../../config/informationHierarchy'
import { ZoneShell } from './ZoneShell'

export function DecisionZone({ decisions, onDecisionClick }) {
  const sorted = [...decisions].sort(byDeadline)
  const overdueCount = decisions.filter((d) => d.status === 'overdue').length

  return (
    <ZoneShell
      id="zone-decisions"
      label="Decisions Pending"
      badge={overdueCount > 0 ? `${overdueCount} overdue` : null}
      badgeColor="red"
    >
      <div className="overflow-y-auto max-h-40">
        {sorted.map((d) => <DecisionCard key={d.id} decision={d} onClick={onDecisionClick} />)}
      </div>
    </ZoneShell>
  )
}
