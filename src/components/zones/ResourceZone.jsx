import clsx from 'clsx'
import { ResourceBar } from '../cards'
import { byUtilization } from '../../config/informationHierarchy'
import { ZoneShell } from './ZoneShell'

export function ResourceZone({ resources }) {
  const sorted = [...resources].sort(byUtilization)
  const overloadCount = resources.filter((r) => r.overload).length

  return (
    <ZoneShell
      id="zone-resources"
      label="Resource Utilization"
      badge={overloadCount > 0 ? `${overloadCount} overloaded` : null}
      badgeColor="red"
    >
      {overloadCount > 0 && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-red-950 border border-red-900 rounded text-caption text-red-300">
          <span>⚠</span>
          <span>{overloadCount} team{overloadCount > 1 ? 's' : ''} over capacity — delivery risk</span>
        </div>
      )}
      <div className="flex flex-col">
        {sorted.map((r) => <ResourceBar key={r.team} resource={r} />)}
      </div>
    </ZoneShell>
  )
}
