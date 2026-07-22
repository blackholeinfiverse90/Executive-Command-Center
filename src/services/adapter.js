/**
 * adapter.js — SETU PMC → Dashboard data contract
 *
 * This is the single translation boundary between the SETU backend
 * and the Executive Command Center UI.
 *
 * Rules:
 *   - All field mapping lives here. Components never touch raw SETU shapes.
 *   - If the SETU schema changes, only this file changes.
 *   - Every derived field (health, confidence, alerts) is computed here.
 *   - dataAsOf is always attached — supports replay-aware rendering.
 */

import { setuApi } from './setuApi'
import { fetchCommandData as fetchMockData } from './mockData'

const USE_MOCK_FALLBACK = import.meta.env.VITE_USE_MOCK_FALLBACK !== 'false'

// ── State → dashboard status mapping ─────────────────────────────────────────

const STATE_TO_STATUS = {
  COMPLETED:   'green',
  IN_PROGRESS: 'amber',
  PENDING:     'amber',
  BLOCKED:     'red',
  FAILED:      'red',
}

const STATE_TO_SEVERITY = {
  BLOCKED: 'critical',
  FAILED:  'high',
  PENDING: 'medium',
  IN_PROGRESS: 'low',
  COMPLETED:   'low',
}

function toStatus(state) {
  return STATE_TO_STATUS[state] ?? 'amber'
}

function toSeverity(state) {
  return STATE_TO_SEVERITY[state] ?? 'medium'
}

// ── Progress derivation ───────────────────────────────────────────────────────
// SETU tasks don't carry a % — derive from milestone completion ratio

function deriveProgress(milestones) {
  if (!milestones?.length) return 0
  const done = milestones.filter((m) => m.status === 'COMPLETED').length
  return Math.round((done / milestones.length) * 100)
}

// ── Next milestone derivation ─────────────────────────────────────────────────

function deriveNextMilestone(milestones) {
  if (!milestones?.length) return 'No milestones'
  const blocked = milestones.find((m) => m.status === 'BLOCKED')
  if (blocked) return 'BLOCKED'
  const pending = milestones.find((m) => m.status === 'PENDING' || m.status === 'IN_PROGRESS')
  return pending?.name ?? 'All complete'
}

// ── Overall health derivation ─────────────────────────────────────────────────

function deriveOverallHealth(projects) {
  if (!projects?.length) return 'amber'
  if (projects.some((p) => p.status === 'red'))   return 'red'
  if (projects.some((p) => p.status === 'amber')) return 'amber'
  return 'green'
}

// ── Alerts derivation — from blocked/failed projects ─────────────────────────

function deriveAlerts(projects, milestones) {
  const alerts = []

  projects.forEach((p) => {
    if (p.status === 'red') {
      alerts.push({
        id:           `alert-${p.id}`,
        severity:     'critical',
        title:        `Blocked — ${p.name}`,
        time:         new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        slaRemaining: '2h',
      })
    } else if (p.status === 'amber' && p.progress < 40) {
      alerts.push({
        id:           `alert-amber-${p.id}`,
        severity:     'high',
        title:        `Low progress — ${p.name} (${p.progress}%)`,
        time:         new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        slaRemaining: '6h',
      })
    }
  })

  // Slipping milestones
  milestones.forEach((m) => {
    if (m.variance > 7) {
      alerts.push({
        id:           `alert-ms-${m.id}`,
        severity:     'high',
        title:        `Milestone slip — ${m.project} +${m.variance}d`,
        time:         new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        slaRemaining: '1d',
      })
    }
  })

  return alerts
}

// ── Risks derivation — from blocked tasks and overdue milestones ──────────────

function deriveRisks(projects, rawMilestones) {
  const risks = []

  projects.forEach((p) => {
    if (p.status === 'red') {
      risks.push({
        id:         `risk-${p.id}`,
        title:      `Delivery blocked`,
        severity:   'critical',
        project:    p.name,
        owner:      p.owner,
        mitigation: 'Pending',
      })
    }
  })

  rawMilestones.forEach((m) => {
    if (m.variance > 0) {
      risks.push({
        id:         `risk-ms-${m.id}`,
        title:      `Milestone slipping +${m.variance}d`,
        severity:   m.variance > 7 ? 'high' : 'medium',
        project:    m.project,
        owner:      '—',
        mitigation: 'Scheduled',
      })
    }
  })

  return risks
}

// ── Resources derivation — from assignments per project ──────────────────────
// SETU assignments are task-level; we aggregate to a synthetic team view

function deriveResources(projects) {
  // Without a real resource API, derive a synthetic utilization from project load
  const total = projects.length || 1
  return [
    {
      team:      'Backend',
      allocated: Math.min(110, Math.round(60 + (projects.filter((p) => p.status !== 'green').length / total) * 50)),
      available: 0,
      overload:  projects.filter((p) => p.status === 'red').length > 1,
    },
    {
      team:      'Frontend',
      allocated: Math.round(50 + (projects.filter((p) => p.status === 'green').length / total) * 30),
      available: 0,
      overload:  false,
    },
    {
      team:      'QA',
      allocated: Math.round(40 + (projects.filter((p) => p.progress > 70).length / total) * 50),
      available: 0,
      overload:  false,
    },
  ].map((r) => ({ ...r, available: Math.max(0, 100 - r.allocated) }))
}

// ── Decisions derivation — from blocked projects needing unblocking ───────────

function deriveDecisions(projects) {
  return projects
    .filter((p) => p.status === 'red' || p.status === 'amber')
    .slice(0, 3)
    .map((p, i) => ({
      id:       `dec-${p.id}`,
      title:    `Unblock ${p.name}`,
      deadline: new Date(Date.now() + (i + 1) * 86400000)
        .toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      owner:    p.owner,
      status:   p.status === 'red' ? 'overdue' : 'pending',
      daysLeft: p.status === 'red' ? -1 : i + 1,
    }))
}

// ── Activity derivation — from recent project updates ────────────────────────

function deriveActivity(projects) {
  return projects.slice(0, 5).map((p, i) => ({
    id:     `ac-${p.id}`,
    actor:  p.owner,
    action: p.status === 'green' ? 'updated status' : p.status === 'red' ? 'raised blocker' : 'updated forecast',
    entity: p.name,
    time:   new Date(Date.now() - i * 900000)
      .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }))
}

// ── Dependencies derivation — from blocked projects ───────────────────────────

function deriveDependencies(projects) {
  const blocked = projects.filter((p) => p.status === 'red')
  return blocked.slice(0, 3).map((p, i) => ({
    id:       `dep-${p.id}`,
    from:     p.name,
    to:       projects.find((x) => x.id !== p.id)?.name ?? 'Unknown',
    type:     'blocked-by',
    reason:   'Dependency unresolved',
    severity: 'critical',
    since:    `${i + 1}d`,
  }))
}

// ── Forecast derivation ───────────────────────────────────────────────────────

function deriveForecast(projects) {
  const total    = projects.length || 1
  const onTrack  = projects.filter((p) => p.status === 'green').length
  const blocked  = projects.filter((p) => p.status === 'red').length
  const atRisk   = total - onTrack - blocked
  const confidence = Math.round((onTrack / total) * 100)
  const avgSlip  = projects.reduce((sum, p) => sum + Math.max(0, 100 - p.progress), 0) / total

  return {
    onTrack,
    atRisk,
    blocked,
    total,
    portfolioConfidence: confidence,
    confidenceDelta:     onTrack > blocked ? 2 : -2,
    projectedSlipDays:   Math.round(avgSlip / 10),
  }
}

// ── Confidence history — 7-day synthetic trend ───────────────────────────────

function deriveConfidenceHistory(confidence) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, i) => ({
    day,
    value: Math.max(60, Math.min(100, confidence - 6 + i)),
  }))
}

// ── Milestone variance derivation ────────────────────────────────────────────

function deriveMilestoneVariance(setuMilestone) {
  // SETU milestones don't carry dates yet — derive from status
  const varianceMap = { COMPLETED: 0, IN_PROGRESS: 0, PENDING: 2, BLOCKED: 15, FAILED: 10 }
  return varianceMap[setuMilestone.status] ?? 0
}

// ── Main adapter ─────────────────────────────────────────────────────────────

export async function fetchCommandData() {
  // 1. Fetch all projects from SETU
  const setuProjects = await setuApi.projects()

  // 2. Fetch milestones + tasks for each project in parallel
  const [milestoneSets, taskSets] = await Promise.all([
    Promise.all(setuProjects.map((p) => setuApi.milestones(p.id).catch(() => []))),
    Promise.all(setuProjects.map((p) => setuApi.projectTasks(p.id).catch(() => []))),
  ])

  // 3. Normalize projects — status derived from real task + milestone states
  const projects = setuProjects.map((p, i) => {
    const pMilestones = milestoneSets[i] ?? []
    const pTasks      = taskSets[i] ?? []
    const progress    = deriveProgress(pMilestones)

    const hasBlockedTask = pTasks.some((t) => t.state === 'BLOCKED')
    const hasFailedTask  = pTasks.some((t) => t.state === 'FAILED')
    const allDone        = pMilestones.length > 0 && pMilestones.every((m) => m.status === 'COMPLETED')

    const status = hasBlockedTask ? 'red'
                 : hasFailedTask  ? 'red'
                 : allDone        ? 'green'
                 : progress > 70  ? 'green'
                 : 'amber'

    return {
      id:            p.id,
      name:          p.name,
      status,
      progress,
      nextMilestone: deriveNextMilestone(pMilestones),
      owner:         p.description ?? '—',
      lastUpdated:   new Date(p.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  })

  // 4. Normalize milestones (flat list across all projects)
  const milestones = setuProjects.flatMap((p, i) =>
    (milestoneSets[i] ?? []).map((m) => {
      const variance = deriveMilestoneVariance(m)
      return {
        id:       m.id,
        project:  p.name,
        name:     m.name,
        planned:  'TBD',
        forecast: 'TBD',
        variance,
        status:   variance === 0 ? 'on-track'
                : variance <= 7  ? 'slipping'
                : variance > 7   ? 'at-risk'
                : 'blocked',
      }
    })
  )

  // 5. Derive all other dashboard zones
  const alerts      = deriveAlerts(projects, milestones)
  const risks       = deriveRisks(projects, milestones)
  const resources   = deriveResources(projects)
  const decisions   = deriveDecisions(projects)
  const activity    = deriveActivity(projects)
  const dependencies = deriveDependencies(projects)
  const forecast    = deriveForecast(projects)
  const confidence  = forecast.portfolioConfidence
  const trend       = forecast.confidenceDelta >= 0 ? 'up' : 'down'

  return {
    // Replay-aware metadata — always present
    dataAsOf: new Date().toISOString(),
    dataSource: 'setu-live',

    summary: {
      overallHealth:       deriveOverallHealth(projects),
      deliveryConfidence:  confidence,
      confidenceTrend:     trend,
      activeProjects:      projects.length,
      criticalRisks:       risks.filter((r) => r.severity === 'critical').length,
      pendingDecisions:    decisions.filter((d) => d.status === 'pending' || d.status === 'overdue').length,
      resourceUtilization: Math.round(resources.reduce((s, r) => s + r.allocated, 0) / resources.length),
      confidenceHistory:   deriveConfidenceHistory(confidence),
    },

    alerts,
    projects,
    risks,
    resources,
    milestones,
    decisions,
    activity,
    dependencies,
    forecast,

    // Tier 3 — escalations and evidence not yet in SETU API; empty arrays
    escalations: [],
    evidence:    [],
  }
}

// ── Fallback orchestrator ─────────────────────────────────────────────────────
// Tries live SETU API first. Falls back to mock if unreachable and fallback is enabled.

export async function fetchCommandDataWithFallback() {
  try {
    return await fetchCommandData()
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      console.warn('[ECC] SETU API unreachable — using mock fallback:', err.message)
      const mock = await fetchMockData()
      return { ...mock, dataAsOf: new Date().toISOString(), dataSource: 'mock-fallback' }
    }
    throw err
  }
}
