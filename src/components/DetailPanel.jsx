import { useEffect, useRef } from 'react'
import { useCommandStore } from '../store/commandStore'
import {
  StatusDot, RiskCard, MilestoneRow,
  EscalationCard, EvidenceCard,
} from './cards'

function PanelSection({ label, children }) {
  return (
    <div>
      <div className="text-micro text-text-secondary uppercase tracking-widest mb-2">{label}</div>
      {children}
    </div>
  )
}

export function DetailPanel({ data }) {
  const { activePanel, panelHistory, closePanel, panelBack, openPanel } = useCommandStore()
  const panelRef = useRef(null)

  // Accessibility: focus trap — keep focus inside panel while open
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // Move focus into panel on open
    const firstFocusable = panel.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      const focusable = Array.from(
        panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.disabled)
      if (!focusable.length) return
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    panel.addEventListener('keydown', handleTab)
    return () => panel.removeEventListener('keydown', handleTab)
  }, [activePanel])

  // Esc closes panel
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closePanel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closePanel])

  if (!activePanel) return null

  const { type, id } = activePanel
  const canGoBack = panelHistory.length > 0

  // Resolve entity
  const project  = type === 'project'    ? data?.projects?.find((p) => p.id === id)     : null
  const risk     = type === 'risk'       ? data?.risks?.find((r) => r.id === id)         : null
  const alert    = type === 'alert'      ? data?.alerts?.find((a) => a.id === id)        : null
  const decision = type === 'decision'   ? data?.decisions?.find((d) => d.id === id)     : null
  const dep      = type === 'dependency' ? data?.dependencies?.find((d) => d.id === id)  : null

  const projectRisks       = project ? (data?.risks?.filter((r) => r.project === project.name)       ?? []) : []
  const projectMilestones  = project ? (data?.milestones?.filter((m) => m.project === project.name)  ?? []) : []
  const projectEscalations = project ? (data?.escalations?.filter((e) => e.project === project.name) ?? []) : []
  const projectEvidence    = project ? (data?.evidence?.filter((e) => e.project === project.name)    ?? []) : []

  // F10: find related project for alert panels
  const alertRelatedProject = alert
    ? data?.projects?.find((p) => alert.title?.toLowerCase().includes(p.name.toLowerCase()))
    : null

  const panelTitle  = project?.name ?? risk?.title ?? alert?.title ?? decision?.title ?? dep?.from ?? 'Detail'
  const panelStatus = project?.status ?? risk?.severity ?? alert?.severity ?? null

  const TYPE_LABEL = {
    project: 'Project', risk: 'Risk', alert: 'Alert',
    decision: 'Decision', dependency: 'Dependency',
  }

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div className="panel-backdrop" onClick={closePanel} aria-hidden="true" />

      {/* Panel — responsive: full-width on mobile, 40vw on lg+ */}
      <aside
        ref={panelRef}
        className="panel-slide-in fixed top-0 right-0 h-full w-full sm:w-[40vw] sm:min-w-80 sm:max-w-xl bg-surface-mid border-l border-border z-50 flex flex-col shadow-2xl"
        aria-label={`${TYPE_LABEL[type] ?? type} detail: ${panelTitle}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {canGoBack && (
              <button
                onClick={panelBack}
                className="text-text-secondary hover:text-text-primary text-body mr-1 flex-shrink-0"
                aria-label="Back to previous panel"
              >
                ←
              </button>
            )}
            {panelStatus && <StatusDot status={panelStatus} size="lg" />}
            <div className="min-w-0">
              <div className="text-micro text-text-secondary uppercase tracking-widest leading-none mb-0.5">
                {TYPE_LABEL[type] ?? type}
              </div>
              <div className="text-body font-semibold truncate">{panelTitle}</div>
            </div>
          </div>
          <button
            onClick={closePanel}
            className="text-text-secondary hover:text-text-primary text-lg leading-none flex-shrink-0 ml-3"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

          {/* PROJECT */}
          {project && (
            <>
              <PanelSection label="Overview">
                <div className="grid grid-cols-2 gap-3 text-body mb-3">
                  <div>
                    <div className="text-caption text-text-secondary mb-0.5">Owner</div>
                    <div>{project.owner}</div>
                  </div>
                  <div>
                    <div className="text-caption text-text-secondary mb-0.5">Last Updated</div>
                    <div>{project.lastUpdated}</div>
                  </div>
                </div>
                <div className="text-caption text-text-secondary mb-1">Progress — {project.progress}%</div>
                <div className="w-full bg-surface-dark rounded-full h-2 mb-3" role="progressbar" aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${project.name} progress`}>
                  <div className="h-2 rounded-full bg-status-green" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="text-caption text-text-secondary mb-0.5">Next Milestone</div>
                <div className="text-body">{project.nextMilestone}</div>
              </PanelSection>

              <PanelSection label="Risks">
                {projectRisks.length
                  ? projectRisks.map((r) => <RiskCard key={r.id} risk={r} />)
                  : <p className="text-caption text-text-secondary">No active risks</p>}
              </PanelSection>

              <PanelSection label="Milestones">
                {projectMilestones.length
                  ? projectMilestones.map((m) => <MilestoneRow key={m.id} milestone={m} />)
                  : <p className="text-caption text-text-secondary">No milestones</p>}
              </PanelSection>

              <PanelSection label="Escalations">
                {projectEscalations.length
                  ? projectEscalations.map((e) => <EscalationCard key={e.id} escalation={e} />)
                  : <p className="text-caption text-text-secondary">No open escalations</p>}
              </PanelSection>

              <PanelSection label="Evidence">
                {projectEvidence.length
                  ? projectEvidence.map((e) => <EvidenceCard key={e.id} evidence={e} />)
                  : <p className="text-caption text-text-secondary">No evidence attached</p>}
              </PanelSection>
            </>
          )}

          {/* RISK */}
          {risk && (
            <PanelSection label="Risk Detail">
              <div className="flex flex-col gap-2 text-body">
                <div><span className="text-caption text-text-secondary">Project: </span>{risk.project}</div>
                <div><span className="text-caption text-text-secondary">Owner: </span>{risk.owner}</div>
                <div><span className="text-caption text-text-secondary">Severity: </span>{risk.severity}</div>
                <div><span className="text-caption text-text-secondary">Mitigation: </span>{risk.mitigation}</div>
              </div>
            </PanelSection>
          )}

          {/* ALERT */}
          {alert && (
            <>
              <PanelSection label="Alert Detail">
                <div className="flex flex-col gap-2 text-body">
                  <div><span className="text-caption text-text-secondary">Severity: </span>{alert.severity}</div>
                  <div><span className="text-caption text-text-secondary">Raised at: </span>{alert.time}</div>
                  <div><span className="text-caption text-text-secondary">SLA Remaining: </span>{alert.slaRemaining}</div>
                </div>
              </PanelSection>
              {/* F10: related project link — pushes to panel history */}
              {alertRelatedProject && (
                <PanelSection label="Related Project">
                  <button
                    className="flex items-center gap-2 text-body text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={() => openPanel('project', alertRelatedProject.id)}
                  >
                    <StatusDot status={alertRelatedProject.status} size="lg" />
                    {alertRelatedProject.name} →
                  </button>
                </PanelSection>
              )}
            </>
          )}

          {/* DECISION */}
          {decision && (
            <>
              <PanelSection label="Decision Detail">
                <div className="flex flex-col gap-2 text-body">
                  <div><span className="text-caption text-text-secondary">Owner: </span>{decision.owner}</div>
                  <div><span className="text-caption text-text-secondary">Deadline: </span>{decision.deadline}</div>
                  <div><span className="text-caption text-text-secondary">Status: </span>{decision.status}</div>
                </div>
              </PanelSection>
              <PanelSection label="Related Evidence">
                {data?.evidence?.length
                  ? data.evidence.slice(0, 2).map((e) => <EvidenceCard key={e.id} evidence={e} />)
                  : <p className="text-caption text-text-secondary">No evidence attached</p>}
              </PanelSection>
            </>
          )}

          {/* DEPENDENCY */}
          {dep && (
            <PanelSection label="Dependency Detail">
              <div className="flex flex-col gap-2 text-body">
                <div><span className="text-caption text-text-secondary">Blocked: </span>{dep.from}</div>
                <div><span className="text-caption text-text-secondary">Blocking: </span>{dep.to}</div>
                <div><span className="text-caption text-text-secondary">Reason: </span>{dep.reason}</div>
                <div><span className="text-caption text-text-secondary">Duration: </span>{dep.since}</div>
                <div><span className="text-caption text-text-secondary">Severity: </span>{dep.severity}</div>
              </div>
            </PanelSection>
          )}

        </div>

        {/* Footer — project panels only */}
        {type === 'project' && (
          <div className="px-5 py-3 border-t border-border flex gap-3 flex-shrink-0">
            <button
              className="flex-1 bg-surface-light hover:bg-border text-body py-2 rounded transition-colors"
              onClick={() => {
                const proj = data?.projects?.find((p) => p.id === id)
                window.alert(`Escalation raised for ${proj?.name ?? id}`)
              }}
            >
              Raise Escalation
            </button>
            <button
              className="flex-1 bg-status-blue hover:opacity-90 text-white text-body py-2 rounded transition-colors"
              onClick={() => {
                const sortedIds = data?.projects
                  ? [...data.projects]
                      .sort((a, b) => ({ red: 0, amber: 1, green: 2 }[a.status] ?? 9) - ({ red: 0, amber: 1, green: 2 }[b.status] ?? 9))
                      .map((p) => p.id)
                  : []
                closePanel()
                useCommandStore.getState().enterFocus(id, sortedIds)
              }}
            >
              Full Focus View
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
