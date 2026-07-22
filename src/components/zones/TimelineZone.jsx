import { lazy, Suspense } from 'react'
import { MilestoneRow } from '../cards'
import { byVariance } from '../../config/informationHierarchy'
import { ZoneShell } from './ZoneShell'

const LazyMilestoneGantt = lazy(() =>
  import('../charts').then((m) => ({ default: m.MilestoneGantt }))
)

export function TimelineZone({ milestones }) {
  const sorted = [...milestones].sort(byVariance)
  const slippingCount = milestones.filter((m) => m.variance > 0).length

  return (
    <ZoneShell
      id="zone-timeline"
      label="Timeline / Delivery"
      badge={slippingCount > 0 ? `${slippingCount} slipping` : null}
      badgeColor="amber"
    >
      <div className="grid grid-cols-12 gap-4">
        {/* Gantt chart — left 5 cols */}
        <div className="col-span-12 md:col-span-5">
          <div className="text-micro text-text-secondary uppercase tracking-wide mb-2">Variance (days)</div>
          <Suspense fallback={
            <div className="animate-pulse bg-surface-light rounded" style={{ height: milestones.length * 28 + 8 }} />
          }>
            <LazyMilestoneGantt milestones={sorted} />
          </Suspense>
        </div>

        {/* Detail table — right 7 cols */}
        <div className="col-span-12 md:col-span-7">
          <div className="grid grid-cols-[7rem_1fr_5rem_5rem] text-micro text-text-secondary uppercase tracking-wide mb-1">
            <span>Project</span>
            <span>Milestone</span>
            <span>Forecast</span>
            <span className="text-right">Variance</span>
          </div>
          <div className="overflow-y-auto max-h-40">
            {sorted.map((m) => <MilestoneRow key={m.id} milestone={m} />)}
          </div>
        </div>
      </div>
    </ZoneShell>
  )
}
