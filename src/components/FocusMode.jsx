import { useEffect } from 'react'
import { useCommandStore } from '../store/commandStore'
import { StatusDot, RiskCard, MilestoneRow, EscalationCard, EvidenceCard } from './cards'
import { bySeverity } from '../config/informationHierarchy'

/**
 * FocusMode — L3 single-project command surface
 *
 * UX Phase 4 additions:
 *   - fade-in animation (focus-fade-in CSS class)
 *   - project switcher: ArrowLeft/ArrowRight + prev/next buttons
 *   - keyboard shortcut strip visible at bottom
 *   - all Tier 3 data filtered to focused project
 */
export function FocusMode({ data }) {
  const { focusProjectId, exitFocus, focusNext, focusPrev, enterFocus } = useCommandStore((s) => s)

  // Build severity-sorted project list for switcher on mount if not already set
  const focusProjectList = useCommandStore((s) => s.focusProjectList)
  useEffect(() => {
    if (data?.projects && focusProjectId && focusProjectList.length === 0) {
      const sorted = [...data.projects].sort(bySeverity).map((p) => p.id)
      enterFocus(focusProjectId, sorted)
    }
  }, [focusProjectId])

  // UX Principle 7: keyboard shortcuts for FocusMode
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' || e.key === 'f') exitFocus()
      if (e.key === 'ArrowRight') focusNext()
      if (e.key === 'ArrowLeft')  focusPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [exitFocus, focusNext, focusPrev])

  const project = data?.projects?.find((p) => p.id === focusProjectId)
  if (!project) return null

  const risks       = data?.risks?.filter((r) => r.project === project.name)       ?? []
  const milestones  = data?.milestones?.filter((m) => m.project === project.name)  ?? []
  const escalations = data?.escalations?.filter((e) => e.project === project.name) ?? []
  const evidence    = data?.evidence?.filter((e) => e.project === project.name)    ?? []

  const sortedProjects = [...(data?.projects ?? [])].sort(bySeverity)
  const currentIdx     = sortedProjects.findIndex((p) => p.id === focusProjectId)
  const prevProject    = sortedProjects[(currentIdx - 1 + sortedProjects.length) % sortedProjects.length]
  const nextProject    = sortedProjects[(currentIdx + 1) % sortedProjects.length]

  const DOT_COLOR = { green: 'bg-status-green', amber: 'bg-status-amber', red: 'bg-status-red' }

  return (
    <div
      className="focus-fade-in fixed inset-0 bg-surface-dark z-40 flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Focus Mode — ${project.name}`}
    >
      {/* Focus header — wraps on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-border flex-shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <StatusDot status={project.status} size="lg" />
          <div>
            <div className="text-micro text-text-secondary uppercase tracking-widest">Focus Mode</div>
            <div className="text-h2 font-semibold">{project.name}</div>
          </div>
          <div className="ml-4 text-caption text-text-secondary">
            {project.owner} · {project.progress}% complete
          </div>
        </div>

        {/* UX Principle 7: project switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={focusPrev}
            className="flex items-center gap-1.5 text-caption text-text-secondary hover:text-text-primary px-3 py-1.5 rounded border border-border hover:border-text-secondary transition-colors"
            title={`← ${prevProject?.name}`}
          >
            ← <span className="hidden sm:inline truncate max-w-24">{prevProject?.name}</span>
          </button>
          <span className="text-micro text-text-secondary">
            {currentIdx + 1} / {sortedProjects.length}
          </span>
          <button
            onClick={focusNext}
            className="flex items-center gap-1.5 text-caption text-text-secondary hover:text-text-primary px-3 py-1.5 rounded border border-border hover:border-text-secondary transition-colors"
            title={`${nextProject?.name} →`}
          >
            <span className="hidden sm:inline truncate max-w-24">{nextProject?.name}</span> →
          </button>
          <button
            onClick={exitFocus}
            className="text-caption text-text-secondary hover:text-text-primary px-3 py-1.5 rounded border border-border hover:border-text-secondary transition-colors ml-2"
            aria-label="Exit focus mode"
          >
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Focus body — scrollable */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Row 1: KPI strip */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-surface-mid border border-border rounded p-4">
            <div className="text-micro text-text-secondary uppercase tracking-widest mb-2">Progress</div>
            <div className="text-display font-bold mb-2">{project.progress}%</div>
            <div className="w-full bg-surface-dark rounded-full h-2"
            role="progressbar"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${project.name} progress`}
          >
              <div className={`h-2 rounded-full ${DOT_COLOR[project.status]}`} style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          <div className="bg-surface-mid border border-border rounded p-4">
            <div className="text-micro text-text-secondary uppercase tracking-widest mb-2">Next Milestone</div>
            <div className="text-h2 font-semibold">{project.nextMilestone}</div>
          </div>
          <div className="bg-surface-mid border border-border rounded p-4">
            <div className="text-micro text-text-secondary uppercase tracking-widest mb-2">Last Updated</div>
            <div className="text-h2 font-semibold">{project.lastUpdated}</div>
          </div>
        </div>

        {/* Row 2: Risks + Milestones */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-surface-mid border border-border rounded p-4">
            <div className="text-micro text-text-secondary uppercase tracking-widest mb-3">Risks</div>
            {risks.length
              ? risks.map((r) => <RiskCard key={r.id} risk={r} />)
              : <p className="text-caption text-text-secondary">No active risks</p>}
          </div>
          <div className="bg-surface-mid border border-border rounded p-4">
            <div className="text-micro text-text-secondary uppercase tracking-widest mb-3">Milestones</div>
            {milestones.length
              ? milestones.map((m) => <MilestoneRow key={m.id} milestone={m} />)
              : <p className="text-caption text-text-secondary">No milestones</p>}
          </div>
        </div>

        {/* Row 3: Escalations + Evidence */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-mid border border-border rounded p-4">
            <div className="text-micro text-text-secondary uppercase tracking-widest mb-3">Escalations</div>
            {escalations.length
              ? escalations.map((e) => <EscalationCard key={e.id} escalation={e} />)
              : <p className="text-caption text-text-secondary">No open escalations</p>}
          </div>
          <div className="bg-surface-mid border border-border rounded p-4">
            <div className="text-micro text-text-secondary uppercase tracking-widest mb-3">Evidence</div>
            {evidence.length
              ? evidence.map((e) => <EvidenceCard key={e.id} evidence={e} />)
              : <p className="text-caption text-text-secondary">No evidence attached</p>}
          </div>
        </div>
      </div>

      {/* UX Principle 10: keyboard shortcut strip */}
      <div className="flex items-center gap-6 px-8 py-2 border-t border-border flex-shrink-0">
        {[['Esc / F', 'Exit'], ['←', 'Prev project'], ['→', 'Next project']].map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5 text-micro text-text-secondary">
            <kbd className="px-1.5 py-0.5 bg-surface-light border border-border rounded text-micro">{key}</kbd>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
