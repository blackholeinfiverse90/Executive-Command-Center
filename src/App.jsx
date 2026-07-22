import { useEffect, useCallback } from 'react'
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
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { ZoneErrorBoundary } from './components/ErrorBoundary'
import { bySeverity }       from './config/informationHierarchy'
import { LOW_SCROLL_NAVIGATION } from './config/uxPrinciples'

export default function App() {
  const { data, isLoading, isError, refetch } = useCommandData()
  const { openPanel, enterFocus, focusMode, activePanel, showShortcuts, toggleShortcuts } = useCommandStore()

  // Performance: stable callbacks — prevent child re-renders on every App render
  const handleAlertClick    = useCallback((a) => openPanel('alert',      a.id), [openPanel])
  const handleProjectClick  = useCallback((p) => openPanel('project',    p.id), [openPanel])
  const handleRiskClick     = useCallback((r) => openPanel('risk',       r.id), [openPanel])
  const handleDecisionClick = useCallback((d) => openPanel('decision',   d.id), [openPanel])
  const handleDepClick      = useCallback((d) => openPanel('dependency', d.id), [openPanel])

  const sortedProjectIds = data
    ? [...data.projects].sort(bySeverity).map((p) => p.id)
    : []

  const handleProjectFocus = useCallback(
    (p) => enterFocus(p.id, sortedProjectIds),
    [enterFocus, sortedProjectIds.join(',')]  // eslint-disable-line react-hooks/exhaustive-deps
  )

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

  // Loading state — full skeleton matching real layout (no layout shift on data arrival)
  if (isLoading) return <DashboardSkeleton />

  // Error state — full screen with retry
  if (isError) return (
    <div className="flex flex-col items-center justify-center h-screen bg-surface-dark gap-4" role="alert">
      <span className="text-red-400 text-body">Failed to load command data.</span>
      <button
        className="text-caption border border-border rounded px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
        onClick={() => refetch()}
      >
        Retry
      </button>
    </div>
  )

  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-dark">

      {/* Accessibility: skip to main content — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-surface-mid focus:text-text-primary focus:px-3 focus:py-1.5 focus:rounded focus:border focus:border-border focus:text-caption"
      >
        Skip to main content
      </a>

      {/* ZONE A — Command Header (Tier 1 — always visible, zero interaction) */}
      {/* aria-live: announces refresh pulse to screen readers */}
      <CommandHeader
        health={data.summary.overallHealth}
        alertCount={data.alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length}
        lastUpdated={now}
        deliveryConfidence={data.summary.deliveryConfidence}
        confidenceTrend={data.summary.confidenceTrend}
        dataSource={data.dataSource}
      />

      <main id="main-content" className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ROW 1 — Executive KPI Bar */}
        <ZoneErrorBoundary zone="Executive Summary">
          <ExecutiveSummary summary={data.summary} />
        </ZoneErrorBoundary>

        {/* ROW 2 — Alerts + Delivery Forecast */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8">
            <ZoneErrorBoundary zone="Alerts">
              <AlertsZone alerts={data.alerts} onAlertClick={handleAlertClick} />
            </ZoneErrorBoundary>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ZoneErrorBoundary zone="Delivery Forecast">
              <DeliveryZone
                forecast={data.forecast}
                confidenceHistory={data.summary.confidenceHistory}
                confidenceTrend={data.summary.confidenceTrend}
              />
            </ZoneErrorBoundary>
          </div>
        </div>

        {/* ROW 3 — Project Health Grid */}
        <ZoneErrorBoundary zone="Project Health">
          <ProjectHealthGrid
            projects={data.projects}
            onProjectClick={handleProjectClick}
            onProjectFocus={handleProjectFocus}
          />
        </ZoneErrorBoundary>

        {/* ROW 4 — Risk + Resource + Decisions */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4">
            <ZoneErrorBoundary zone="Risks">
              <RiskZone risks={data.risks} onRiskClick={handleRiskClick} />
            </ZoneErrorBoundary>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ZoneErrorBoundary zone="Resources">
              <ResourceZone resources={data.resources} />
            </ZoneErrorBoundary>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ZoneErrorBoundary zone="Decisions">
              <DecisionZone decisions={data.decisions} onDecisionClick={handleDecisionClick} />
            </ZoneErrorBoundary>
          </div>
        </div>

        {/* ROW 5 — Timeline */}
        <ZoneErrorBoundary zone="Timeline">
          <TimelineZone milestones={data.milestones} />
        </ZoneErrorBoundary>

        {/* ROW 6 — Dependencies + Activity */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <ZoneErrorBoundary zone="Dependencies">
              <DependencyZone dependencies={data.dependencies} onDepClick={handleDepClick} />
            </ZoneErrorBoundary>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <ZoneErrorBoundary zone="Activity Feed">
              <ActivityFeed activity={data.activity} />
            </ZoneErrorBoundary>
          </div>
        </div>

      </main>

      {/* UX Principle 10: keyboard shortcut overlay */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
          onClick={toggleShortcuts}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <div
            className="bg-surface-mid border border-border rounded p-6 min-w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-body font-semibold mb-4">Keyboard Shortcuts</div>
            <div className="flex flex-col gap-2">
              {[
                ['1–7', 'Jump to zone'],
                ['Esc', 'Close panel / Exit focus'],
                ['F',   'Exit focus mode'],
                ['← →', 'Prev / Next project in focus'],
                ['?',   'Toggle this overlay'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-8">
                  <kbd className="text-caption px-2 py-0.5 bg-surface-light border border-border rounded">{key}</kbd>
                  <span className="text-caption text-text-secondary">{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={toggleShortcuts}
              className="mt-4 text-caption text-text-secondary hover:text-text-primary"
              autoFocus
            >
              Close
            </button>
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
