import { useEffect } from 'react'
import { useCommandData } from './hooks/useCommandData'
import { useCommandStore } from './store/commandStore'
import { CommandHeader }    from './components/zones/CommandHeader'
import { ExecutiveSummary } from './components/zones/ExecutiveSummary'
import { AlertsZone }       from './components/zones/AlertsZone'
import { ProjectHealthGrid } from './components/zones/ProjectHealthGrid'
import { RiskZone }         from './components/zones/RiskZone'
import { ResourceZone }     from './components/zones/ResourceZone'
import { TimelineZone }     from './components/zones/TimelineZone'
import { DecisionZone }     from './components/zones/DecisionZone'
import { ActivityFeed }     from './components/zones/ActivityFeed'
import { DeliveryZone }     from './components/zones/DeliveryZone'
import { DependencyZone }   from './components/zones/DependencyZone'
import { DetailPanel }      from './components/DetailPanel'
import { FocusMode }        from './components/FocusMode'
import { bySeverity }       from './config/informationHierarchy'
import { LOW_SCROLL_NAVIGATION } from './config/uxPrinciples'

export default function App() {
  const { data, isLoading, isError } = useCommandData()
  const { openPanel, enterFocus, focusMode, activePanel, showShortcuts, toggleShortcuts, closePanel } = useCommandStore()

  // UX Principle 3: number keys jump to zones
  // UX Principle 10: ? toggles shortcut overlay
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const anchor = LOW_SCROLL_NAVIGATION.zoneAnchors[e.key]
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (e.key === '?') toggleShortcuts()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleShortcuts])

  // Sorted project ids for FocusMode switcher
  const sortedProjectIds = data ? [...data.projects].sort(bySeverity).map((p) => p.id) : []

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen text-text-secondary text-body">
      Loading command data…
    </div>
  )
  if (isError) return (
    <div className="flex items-center justify-center h-screen text-red-400 text-body">
      Failed to load command data.
    </div>
  )

  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-dark">

      {/* ─── ZONE A — Command Header (Tier 1 — always visible, zero interaction) */}
      <CommandHeader
        health={data.summary.overallHealth}
        alertCount={data.alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length}
        lastUpdated={now}
        deliveryConfidence={data.summary.deliveryConfidence}
        confidenceTrend={data.summary.confidenceTrend}
      />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ─── ROW 1 — Executive KPI Bar (full width) */}
        {/* Zone B: 5 KPIs in a single scannable row — no sidebar */}
        <ExecutiveSummary summary={data.summary} />

        {/* ─── ROW 2 — Alerts + Delivery Forecast */}
        {/* Alerts (threat) paired with Delivery (trajectory) — both answer urgency questions */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8">
            <AlertsZone
              alerts={data.alerts}
              onAlertClick={(a) => openPanel('alert', a.id)}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <DeliveryZone
            forecast={data.forecast}
            confidenceHistory={data.summary.confidenceHistory}
            confidenceTrend={data.summary.confidenceTrend}
          />
          </div>
        </div>

        {/* ─── ROW 3 — Project Health Grid (full width) */}
        {/* Widest zone — needs full width for the grid to breathe */}
        <ProjectHealthGrid
          projects={data.projects}
          onProjectClick={(p) => openPanel('project', p.id)}
          onProjectFocus={(p) => enterFocus(p.id, sortedProjectIds)}
        />

        {/* ─── ROW 4 — Risk + Resource + Decisions (3-col) */}
        {/* Three threat/action zones together — executive scans left to right */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4">
            <RiskZone risks={data.risks} onRiskClick={(r) => openPanel('risk', r.id)} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ResourceZone resources={data.resources} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <DecisionZone decisions={data.decisions} onDecisionClick={(d) => openPanel('decision', d.id)} />
          </div>
        </div>

        {/* ─── ROW 5 — Timeline (full width) */}
        {/* Needs full width for the milestone table to be readable */}
        <TimelineZone milestones={data.milestones} />

        {/* ─── ROW 6 — Dependencies + Activity (2-col) */}
        {/* Dependencies = actionable blocker info. Activity = log. Unequal weight. */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <DependencyZone dependencies={data.dependencies} onDepClick={(d) => openPanel('dependency', d.id)} />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <ActivityFeed activity={data.activity} />
          </div>
        </div>

      </main>

      {/* UX Principle 10: keyboard shortcut overlay */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60"
          onClick={toggleShortcuts}
        >
          <div className="bg-surface-mid border border-border rounded p-6 min-w-72" onClick={(e) => e.stopPropagation()}>
            <div className="text-body font-semibold mb-4">Keyboard Shortcuts</div>
            <div className="flex flex-col gap-2">
              {[['1–7','Jump to zone'],['Esc','Close panel / Exit focus'],['F','Exit focus mode'],['←  →','Prev / Next project in focus'],['?','Toggle this overlay']]
                .map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-8">
                    <kbd className="text-caption px-2 py-0.5 bg-surface-light border border-border rounded">{key}</kbd>
                    <span className="text-caption text-text-secondary">{label}</span>
                  </div>
                ))}
            </div>
            <button onClick={toggleShortcuts} className="mt-4 text-caption text-text-secondary hover:text-text-primary">Close</button>
          </div>
        </div>
      )}

      {/* L2 — Detail Panel */}
      {activePanel && <DetailPanel data={data} />}

      {/* L3 — Focus Mode */}
      {focusMode && <FocusMode data={data} />}
    </div>
  )
}
