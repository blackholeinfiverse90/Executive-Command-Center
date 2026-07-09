import { ProjectHealthCard } from '../cards'
import { bySeverity } from '../../config/informationHierarchy'
import { ZoneShell } from './ZoneShell'

export function ProjectHealthGrid({ projects, onProjectClick, onProjectFocus }) {
  const sorted = [...projects].sort(bySeverity)
  const problemCount = projects.filter((p) => p.status === 'red' || p.status === 'amber').length

  return (
    <ZoneShell
      id="zone-project-health"
      label="Project Health"
      badge={problemCount > 0 ? `${problemCount} need attention` : null}
      badgeColor="amber"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {sorted.map((p) => (
          <ProjectHealthCard
            key={p.id}
            project={p}
            onClick={onProjectClick}
            onDoubleClick={onProjectFocus}
          />
        ))}
      </div>
    </ZoneShell>
  )
}
