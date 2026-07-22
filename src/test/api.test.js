/**
 * api.test.js — mock data contract + adapter fallback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/setuApi', () => ({
  setuApi: {
    projects:     vi.fn(),
    milestones:   vi.fn(),
    projectTasks: vi.fn(),
    health:       vi.fn(),
    ready:        vi.fn(),
  },
}))

import { fetchCommandData as fetchMock } from '../services/mockData'
import { setuApi } from '../services/setuApi'

const REQUIRED_KEYS = [
  'summary', 'alerts', 'projects', 'risks', 'resources',
  'milestones', 'decisions', 'activity', 'dependencies',
  'escalations', 'evidence', 'forecast', 'dataSource', 'dataAsOf',
]

describe('Mock data contract', () => {
  let data
  beforeEach(async () => { data = await fetchMock() })

  it('returns all required top-level keys', () => {
    REQUIRED_KEYS.forEach((key) => expect(data, `missing: ${key}`).toHaveProperty(key))
  })

  it('summary has all required keys', () => {
    ;['overallHealth', 'deliveryConfidence', 'confidenceTrend', 'activeProjects',
      'criticalRisks', 'pendingDecisions', 'resourceUtilization', 'confidenceHistory',
    ].forEach((key) => expect(data.summary, `missing summary.${key}`).toHaveProperty(key))
  })

  it('projects are non-empty with valid status and progress', () => {
    expect(data.projects.length).toBeGreaterThan(0)
    data.projects.forEach((p) => {
      expect(['green', 'amber', 'red']).toContain(p.status)
      expect(p.progress).toBeGreaterThanOrEqual(0)
      expect(p.progress).toBeLessThanOrEqual(100)
    })
  })

  it('alerts have valid severities', () => {
    data.alerts.forEach((a) => {
      expect(['critical', 'high', 'medium', 'low']).toContain(a.severity)
    })
  })

  it('confidenceHistory has 7 entries with value in 0–100', () => {
    expect(data.summary.confidenceHistory).toHaveLength(7)
    data.summary.confidenceHistory.forEach((e) => {
      expect(e.value).toBeGreaterThanOrEqual(0)
      expect(e.value).toBeLessThanOrEqual(100)
    })
  })

  it('forecast totals are consistent (onTrack + atRisk + blocked === total)', () => {
    const f = data.forecast
    expect(f.onTrack + f.atRisk + f.blocked).toBe(f.total)
  })

  it('dataSource is mock-fallback', () => {
    expect(data.dataSource).toBe('mock-fallback')
  })

  it('dataAsOf is an ISO timestamp', () => {
    expect(data.dataAsOf).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('Adapter fallback', () => {
  it('returns mock-fallback dataSource when SETU API throws', async () => {
    setuApi.projects.mockRejectedValue(new Error('Network error'))
    const { fetchCommandDataWithFallback } = await import('../services/adapter')
    const result = await fetchCommandDataWithFallback()
    expect(result.dataSource).toBe('mock-fallback')
    REQUIRED_KEYS.forEach((key) => expect(result).toHaveProperty(key))
  })
})
