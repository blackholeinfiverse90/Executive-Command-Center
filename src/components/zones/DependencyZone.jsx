import { ZoneShell } from './ZoneShell'
import { DependencyCard } from '../cards'
import { bySeverity } from '../../config/informationHierarchy'

/**
 * DependencyZone — Cross-Project Blockers
 *
 * Answers: "Which projects are blocking other projects?"
 * Tier 2 zone — always visible, no interaction required.
 *
 * An executive cannot unblock a project they don't know is blocked.
 * This zone makes cross-project dependencies visible at the portfolio level.
 * Sorted by severity — critical blockers always surface first.
 */
export function DependencyZone({ dependencies, onDepClick }) {
  const sorted = [...dependencies].sort(bySeverity)
  const blockedCount = dependencies.filter((d) => d.type === 'blocked-by').length

  return (
    <ZoneShell
      id="zone-dependencies"
      label="Dependencies & Blockers"
      badge={blockedCount > 0 ? `${blockedCount} blocked` : null}
      badgeColor="red"
    >
      {sorted.length === 0 ? (
        <p className="text-caption text-text-secondary">No active blockers</p>
      ) : (
        <div className="overflow-y-auto max-h-40">
          {sorted.map((dep) => (
            <DependencyCard key={dep.id} dep={dep} onClick={onDepClick} />
          ))}
        </div>
      )}
    </ZoneShell>
  )
}
