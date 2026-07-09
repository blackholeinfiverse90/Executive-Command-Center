/**
 * BHIV Executive Command Center — Deliverable 10
 * INTERACTION FLOWS
 *
 * Step-by-step sequences for every interaction path.
 * Each flow defines: trigger → steps → outcome → exit.
 * These flows are the behavioral contract of the dashboard.
 *
 * Flows covered:
 *   F1  — Page Load
 *   F2  — Open Detail Panel (L2)
 *   F3  — Navigate Panel History (back)
 *   F4  — Close Detail Panel
 *   F5  — Enter Focus Mode (L3)
 *   F6  — Switch Projects in Focus Mode
 *   F7  — Exit Focus Mode
 *   F8  — Zone Jump (keyboard 1–7)
 *   F9  — Data Auto-Refresh
 *   F10 — Alert Click → Detail Panel
 *   F11 — Risk Click → Detail Panel
 *   F12 — Decision Click → Detail Panel
 *   F13 — Dependency Click → Detail Panel
 *   F14 — Keyboard Shortcut Overlay
 *   F15 — Stale Data Warning
 */

// ─── F1: PAGE LOAD ────────────────────────────────────────────────────────────

export const F1_PAGE_LOAD = {
  id: 'F1',
  name: 'Page Load',
  trigger: 'User navigates to dashboard URL',
  actor: 'Executive (browser)',

  steps: [
    { step: 1, action: 'Browser loads index.html, React mounts App.jsx' },
    { step: 2, action: 'TanStack Query fires fetchCommandData() immediately (no delay)' },
    { step: 3, action: 'isLoading = true — full-screen "Loading command data…" shown' },
    { step: 4, action: 'fetchCommandData() resolves with data object' },
    { step: 5, action: 'isLoading = false — dashboard renders in one pass' },
    { step: 6, action: 'CommandHeader renders with health dot, alert count, confidence, timestamp' },
    { step: 7, action: 'All 6 rows render simultaneously — no progressive zone loading' },
    { step: 8, action: 'markRefreshed() fires — lastRefreshed set, refresh pulse triggers on CommandHeader' },
    { step: 9, action: 'TanStack Query schedules next refetch at T+30s' },
    { step: 10, action: 'Executive sees full Tier 1 + Tier 2 dashboard — no interaction required' },
  ],

  outcome: 'Full dashboard visible within 1–2s on corporate network. Executive can begin scanning immediately.',
  errorPath: 'isError = true → full-screen "Failed to load command data." with no retry UI (TanStack Query retries automatically in background)',
  timeToFirstMeaningfulContent: '<500ms for CommandHeader, <1s for full dashboard',
}

// ─── F2: OPEN DETAIL PANEL (L2) ───────────────────────────────────────────────

export const F2_OPEN_DETAIL_PANEL = {
  id: 'F2',
  name: 'Open Detail Panel',
  trigger: 'Single click on any interactive card (ProjectHealthCard, AlertCard, RiskCard, DecisionCard, DependencyCard)',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive clicks a card (e.g. ProjectHealthCard for "Project Kiran")' },
    { step: 2, action: 'onClick handler fires: openPanel("project", "p2")' },
    { step: 3, action: 'Zustand: if activePanel exists, push it to panelHistory stack' },
    { step: 4, action: 'Zustand: set activePanel = { type: "project", id: "p2" }' },
    { step: 5, action: 'App.jsx: activePanel is truthy → renders <DetailPanel data={data} />' },
    { step: 6, action: 'DetailPanel mounts with panel-slide-in animation (200ms ease-out from right)' },
    { step: 7, action: 'panel-backdrop div renders at z-49 (transparent, click-to-close)' },
    { step: 8, action: 'DetailPanel reads activePanel.type = "project", activePanel.id = "p2"' },
    { step: 9, action: 'DetailPanel finds project = data.projects.find(p => p.id === "p2")' },
    { step: 10, action: 'DetailPanel renders: entity header, risks, milestones, escalations, evidence filtered to this project' },
    { step: 11, action: 'Dashboard remains visible at 60% left — executive sees both simultaneously' },
    { step: 12, action: 'Focus moves to DetailPanel — keyboard navigation continues inside panel' },
  ],

  outcome: 'L2 panel open, showing Tier 3 data for the clicked entity. Dashboard context preserved.',
  panelWidth: '40vw (min 320px, max 576px)',
  contextPreservation: 'Dashboard is NOT hidden — executive sees both panel and dashboard',
}

// ─── F3: NAVIGATE PANEL HISTORY (BACK) ───────────────────────────────────────

export const F3_PANEL_BACK = {
  id: 'F3',
  name: 'Panel Back Navigation',
  trigger: 'Executive clicks ← back button inside DetailPanel',
  precondition: 'panelHistory.length > 0 (executive navigated from one panel to another)',
  actor: 'Executive',

  exampleScenario: 'Executive opened Project Kiran panel, then clicked a risk inside it to open Risk panel. Now wants to go back to Project Kiran.',

  steps: [
    { step: 1, action: 'Executive clicks ← back button in DetailPanel header' },
    { step: 2, action: 'panelBack() fires in Zustand store' },
    { step: 3, action: 'Zustand: pop last item from panelHistory stack' },
    { step: 4, action: 'Zustand: set activePanel = popped item (e.g. { type: "project", id: "p2" })' },
    { step: 5, action: 'DetailPanel re-renders with previous panel content' },
    { step: 6, action: 'Back button disappears if panelHistory is now empty' },
  ],

  outcome: 'Executive returns to previous panel without losing context. Stack unwinds correctly.',
  maxDepth: 'No enforced limit — stack grows with each openPanel() call',
}

// ─── F4: CLOSE DETAIL PANEL ───────────────────────────────────────────────────

export const F4_CLOSE_PANEL = {
  id: 'F4',
  name: 'Close Detail Panel',
  trigger: 'One of three exit modes',
  actor: 'Executive',

  exitModes: [
    {
      mode: 'Esc key',
      steps: [
        { step: 1, action: 'Executive presses Esc' },
        { step: 2, action: 'DetailPanel useEffect keydown handler fires' },
        { step: 3, action: 'closePanel() called — activePanel = null, panelHistory = []' },
        { step: 4, action: 'DetailPanel unmounts' },
        { step: 5, action: 'Dashboard returns to full-width view' },
      ],
    },
    {
      mode: '✕ button',
      steps: [
        { step: 1, action: 'Executive clicks ✕ in panel header' },
        { step: 2, action: 'closePanel() called directly' },
        { step: 3, action: 'Same outcome as Esc' },
      ],
    },
    {
      mode: 'Click backdrop',
      steps: [
        { step: 1, action: 'Executive clicks the transparent panel-backdrop div' },
        { step: 2, action: 'backdrop onClick fires closePanel()' },
        { step: 3, action: 'Same outcome as Esc' },
      ],
    },
  ],

  outcome: 'Panel closed, history cleared, dashboard returns to full-width. Scroll position preserved.',
  scrollPreservation: 'main element scroll position is not reset — executive returns to where they were',
}

// ─── F5: ENTER FOCUS MODE (L3) ────────────────────────────────────────────────

export const F5_ENTER_FOCUS = {
  id: 'F5',
  name: 'Enter Focus Mode',
  trigger: 'Double-click on ProjectHealthCard',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive double-clicks a ProjectHealthCard (e.g. "Project Kiran")' },
    { step: 2, action: 'onDoubleClick handler fires: enterFocus("p2", sortedProjectIds)' },
    { step: 3, action: 'sortedProjectIds = data.projects sorted by bySeverity — red first' },
    { step: 4, action: 'Zustand: focusMode = true, focusProjectId = "p2", focusProjectList = sortedIds' },
    { step: 5, action: 'App.jsx: focusMode is truthy → renders <FocusMode data={data} />' },
    { step: 6, action: 'FocusMode mounts with focus-fade-in animation (150ms)' },
    { step: 7, action: 'FocusMode covers full viewport (position fixed inset-0 z-55)' },
    { step: 8, action: 'FocusMode reads focusProjectId, finds project in data.projects' },
    { step: 9, action: 'FocusMode renders: header (name, status, owner, switcher, exit), progress, risks, milestones, escalations, evidence — all filtered to this project' },
    { step: 10, action: 'Keyboard listeners activate: Esc/F = exit, ← → = switch projects' },
  ],

  outcome: 'Full-screen single-project view. All other zones hidden. Executive has complete project context.',
  dataScope: 'All data filtered to focusProjectId — no other project data visible',
}

// ─── F6: SWITCH PROJECTS IN FOCUS MODE ───────────────────────────────────────

export const F6_FOCUS_SWITCH = {
  id: 'F6',
  name: 'Switch Projects in Focus Mode',
  trigger: 'ArrowLeft or ArrowRight key while in Focus Mode, or prev/next buttons',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive presses ArrowRight (or clicks next →)' },
    { step: 2, action: 'FocusMode keydown handler fires focusNext()' },
    { step: 3, action: 'Zustand focusNext(): find current index in focusProjectList, advance by 1 (wraps)' },
    { step: 4, action: 'Zustand: focusProjectId = next project id in severity-sorted list' },
    { step: 5, action: 'FocusMode re-renders with new project data — no animation, instant update' },
    { step: 6, action: 'Header updates: new project name, status dot, owner' },
    { step: 7, action: 'All sections update: risks, milestones, escalations, evidence for new project' },
  ],

  outcome: 'Executive moves through all projects by severity order without exiting Focus Mode. Maintains flow state.',
  order: 'Severity-sorted: red projects first, then amber, then green',
  wrapping: 'Circular — last project wraps to first',
}

// ─── F7: EXIT FOCUS MODE ──────────────────────────────────────────────────────

export const F7_EXIT_FOCUS = {
  id: 'F7',
  name: 'Exit Focus Mode',
  trigger: 'One of three exit modes',
  actor: 'Executive',

  exitModes: [
    { mode: 'Esc key',    handler: 'FocusMode keydown listener → exitFocus()' },
    { mode: 'F key',      handler: 'FocusMode keydown listener → exitFocus()' },
    { mode: 'Exit button', handler: 'onClick → exitFocus()' },
  ],

  steps: [
    { step: 1, action: 'Exit triggered by any of the three modes' },
    { step: 2, action: 'exitFocus() called in Zustand: focusMode = false, focusProjectId = null, focusProjectList = []' },
    { step: 3, action: 'FocusMode unmounts' },
    { step: 4, action: 'Dashboard returns to full view — all zones visible again' },
    { step: 5, action: 'Scroll position preserved — executive returns to where they were' },
  ],

  outcome: 'Dashboard restored. Executive returns to Tier 2 scan view.',
}

// ─── F8: ZONE JUMP (KEYBOARD 1–7) ────────────────────────────────────────────

export const F8_ZONE_JUMP = {
  id: 'F8',
  name: 'Zone Jump via Keyboard',
  trigger: 'Press number key 1–7 while dashboard is in focus',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive presses a number key (e.g. "3")' },
    { step: 2, action: 'App.jsx global keydown handler fires' },
    { step: 3, action: 'Check: e.target is not INPUT or TEXTAREA (prevent conflict with form inputs)' },
    { step: 4, action: 'Look up LOW_SCROLL_NAVIGATION.zoneAnchors["3"] = "zone-project-health"' },
    { step: 5, action: 'document.getElementById("zone-project-health").scrollIntoView({ behavior: "smooth", block: "start" })' },
    { step: 6, action: 'Page scrolls smoothly to ProjectHealthGrid zone' },
  ],

  zoneMap: {
    '1': 'zone-executive-summary',
    '2': 'zone-alerts',
    '3': 'zone-project-health',
    '4': 'zone-risks',
    '5': 'zone-timeline',
    '6': 'zone-decisions',
    '7': 'zone-dependencies',
  },

  outcome: 'Executive reaches any zone in 1 keypress. No scrolling required.',
  conflictPrevention: 'Handler checks e.target.tagName — does not fire inside input fields',
}

// ─── F9: DATA AUTO-REFRESH ────────────────────────────────────────────────────

export const F9_AUTO_REFRESH = {
  id: 'F9',
  name: 'Data Auto-Refresh',
  trigger: 'TanStack Query refetchInterval fires every 30 seconds',
  actor: 'System (automatic)',

  steps: [
    { step: 1, action: 'T+30s: TanStack Query fires background refetch of fetchCommandData()' },
    { step: 2, action: 'Fetch runs silently — no loading spinner, no visual disruption' },
    { step: 3, action: 'New data arrives — TanStack Query updates the cache' },
    { step: 4, action: 'React re-renders only components whose data changed' },
    { step: 5, action: 'useCommandData useEffect detects dataUpdatedAt changed → markRefreshed()' },
    { step: 6, action: 'Zustand: lastRefreshed = new Date(), isRefreshPulsing = true' },
    { step: 7, action: 'CommandHeader: isRefreshPulsing = true → refresh-pulse CSS class applied' },
    { step: 8, action: 'Green border pulse animates for 600ms on CommandHeader' },
    { step: 9, action: 'setTimeout 700ms: isRefreshPulsing = false, pulse class removed' },
    { step: 10, action: 'CommandHeader timestamp updates to new time' },
    { step: 11, action: 'TanStack Query schedules next refetch at T+60s' },
  ],

  outcome: 'Executive sees a brief green pulse — knows data just refreshed. No disruption to current view.',
  staleWarning: 'If refetch fails, timestamp stays at last successful time. After 2 minutes, timestamp turns amber.',
  backgroundBehavior: 'Refetch happens even if DetailPanel or FocusMode is open — data stays fresh',
}

// ─── F10: ALERT CLICK → DETAIL PANEL ─────────────────────────────────────────

export const F10_ALERT_CLICK = {
  id: 'F10',
  name: 'Alert Click → Detail Panel',
  trigger: 'Single click on AlertCard',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive clicks an AlertCard (e.g. "Dependency block — Project Kiran")' },
    { step: 2, action: 'AlertsZone onClick: openPanel("alert", "a1")' },
    { step: 3, action: 'DetailPanel opens (F2 flow)' },
    { step: 4, action: 'DetailPanel type = "alert" → renders alert-specific layout' },
    { step: 5, action: 'Shows: alert title, severity, SLA remaining, time raised, related project' },
    { step: 6, action: 'Related project shown as a clickable link → opens project panel (pushes to history)' },
  ],

  outcome: 'Executive sees full alert context. Can navigate to related project without closing the alert panel.',
}

// ─── F11: RISK CLICK → DETAIL PANEL ──────────────────────────────────────────

export const F11_RISK_CLICK = {
  id: 'F11',
  name: 'Risk Click → Detail Panel',
  trigger: 'Single click on RiskCard',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive clicks a RiskCard (e.g. "Vendor delay — CRITICAL")' },
    { step: 2, action: 'RiskZone onClick: openPanel("risk", "r1")' },
    { step: 3, action: 'DetailPanel opens (F2 flow)' },
    { step: 4, action: 'DetailPanel type = "risk" → renders risk-specific layout' },
    { step: 5, action: 'Shows: risk title, severity, project, owner, mitigation status, description' },
  ],

  outcome: 'Executive sees full risk context including mitigation owner and status.',
}

// ─── F12: DECISION CLICK → DETAIL PANEL ──────────────────────────────────────

export const F12_DECISION_CLICK = {
  id: 'F12',
  name: 'Decision Click → Detail Panel',
  trigger: 'Single click on DecisionCard',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive clicks a DecisionCard (e.g. "Vendor selection — OVERDUE")' },
    { step: 2, action: 'DecisionZone onClick: openPanel("decision", "d1")' },
    { step: 3, action: 'DetailPanel opens (F2 flow)' },
    { step: 4, action: 'DetailPanel type = "decision" → renders decision-specific layout' },
    { step: 5, action: 'Shows: decision title, deadline, owner, status, days overdue, related evidence' },
  ],

  outcome: 'Executive sees full decision context. Overdue decisions are visually prominent.',
}

// ─── F13: DEPENDENCY CLICK → DETAIL PANEL ────────────────────────────────────

export const F13_DEPENDENCY_CLICK = {
  id: 'F13',
  name: 'Dependency Click → Detail Panel',
  trigger: 'Single click on DependencyCard',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive clicks a DependencyCard (e.g. "Kiran BLOCKED BY Alpha")' },
    { step: 2, action: 'DependencyZone onClick: openPanel("dependency", "dep1")' },
    { step: 3, action: 'DetailPanel opens (F2 flow)' },
    { step: 4, action: 'DetailPanel type = "dependency" → renders dependency-specific layout' },
    { step: 5, action: 'Shows: from project, to project, type (blocked-by/waiting-on), reason, duration, severity' },
  ],

  outcome: 'Executive sees full blocker context — who is blocking whom, why, and for how long.',
}

// ─── F14: KEYBOARD SHORTCUT OVERLAY ──────────────────────────────────────────

export const F14_SHORTCUT_OVERLAY = {
  id: 'F14',
  name: 'Keyboard Shortcut Overlay',
  trigger: '? key',
  actor: 'Executive',

  steps: [
    { step: 1, action: 'Executive presses ?' },
    { step: 2, action: 'App.jsx global keydown handler: e.key === "?" → toggleShortcuts()' },
    { step: 3, action: 'Zustand: showShortcuts = true' },
    { step: 4, action: 'App.jsx renders shortcut overlay modal (z-60)' },
    { step: 5, action: 'Overlay shows all keyboard shortcuts in a centered panel' },
    { step: 6, action: 'Executive presses ? again, or clicks backdrop, or clicks Close button' },
    { step: 7, action: 'toggleShortcuts() → showShortcuts = false → overlay unmounts' },
  ],

  outcome: 'Executive can discover all keyboard shortcuts at any time without leaving the dashboard.',
}

// ─── F15: STALE DATA WARNING ──────────────────────────────────────────────────

export const F15_STALE_WARNING = {
  id: 'F15',
  name: 'Stale Data Warning',
  trigger: 'Data has not refreshed for > 2 minutes (network failure or API down)',
  actor: 'System (automatic)',

  steps: [
    { step: 1, action: 'TanStack Query background refetch fails (network error or API 5xx)' },
    { step: 2, action: 'TanStack Query retries automatically (3 retries with exponential backoff)' },
    { step: 3, action: 'All retries fail — isError may be set but data remains from last successful fetch' },
    { step: 4, action: 'lastRefreshed timestamp in Zustand is now > 2 minutes old' },
    { step: 5, action: 'CommandHeader checks: Date.now() - lastRefreshed > 120_000' },
    { step: 6, action: 'Timestamp text color changes from text-secondary to amber — stale warning' },
    { step: 7, action: 'Executive sees amber timestamp — knows data may be stale' },
    { step: 8, action: 'When API recovers, next successful refetch resets lastRefreshed and clears amber' },
  ],

  outcome: 'Executive is never silently looking at stale data. Trust in the dashboard is maintained.',
  principle: 'UX Principle 9: Data Freshness — stale data is worse than no data',
}

// ─── INTERACTION FLOW SUMMARY ─────────────────────────────────────────────────

export const INTERACTION_FLOW_SUMMARY = {
  totalFlows: 15,
  flows: [
    { id: 'F1',  name: 'Page Load',                      trigger: 'URL navigation' },
    { id: 'F2',  name: 'Open Detail Panel',              trigger: 'Single click on card' },
    { id: 'F3',  name: 'Panel Back Navigation',          trigger: 'Back button in panel' },
    { id: 'F4',  name: 'Close Detail Panel',             trigger: 'Esc / ✕ / backdrop click' },
    { id: 'F5',  name: 'Enter Focus Mode',               trigger: 'Double-click on project card' },
    { id: 'F6',  name: 'Switch Projects in Focus Mode',  trigger: 'ArrowLeft / ArrowRight' },
    { id: 'F7',  name: 'Exit Focus Mode',                trigger: 'Esc / F / Exit button' },
    { id: 'F8',  name: 'Zone Jump',                      trigger: 'Number key 1–7' },
    { id: 'F9',  name: 'Data Auto-Refresh',              trigger: 'System — every 30s' },
    { id: 'F10', name: 'Alert Click',                    trigger: 'Click AlertCard' },
    { id: 'F11', name: 'Risk Click',                     trigger: 'Click RiskCard' },
    { id: 'F12', name: 'Decision Click',                 trigger: 'Click DecisionCard' },
    { id: 'F13', name: 'Dependency Click',               trigger: 'Click DependencyCard' },
    { id: 'F14', name: 'Shortcut Overlay',               trigger: '? key' },
    { id: 'F15', name: 'Stale Data Warning',             trigger: 'System — API failure > 2min' },
  ],

  implementationStatus: 'All 15 flows are fully implemented in the running application.',
  stateOwner: 'Zustand commandStore.js owns all interaction state',
  dataOwner: 'TanStack Query useCommandData.js owns all data state',
}
