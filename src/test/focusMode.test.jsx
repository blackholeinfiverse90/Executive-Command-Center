/**
 * focusMode.test.jsx — FocusMode render / exit / navigate / keyboard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { FocusMode } from '../components/FocusMode'
import { useCommandStore } from '../store/commandStore'

afterEach(() => cleanup())

vi.mock('../config/informationHierarchy', () => ({
  bySeverity: (a, b) => {
    const order = { red: 0, amber: 1, green: 2 }
    return (order[a.status] ?? 9) - (order[b.status] ?? 9)
  },
}))

const DATA = {
  projects: [
    { id: 'p1', name: 'Project Alpha', status: 'green', progress: 78, nextMilestone: 'Sprint Review', owner: 'Ravi S.', lastUpdated: '14:20' },
    { id: 'p2', name: 'Project Kiran', status: 'red',   progress: 34, nextMilestone: 'BLOCKED',       owner: 'Priya M.', lastUpdated: '14:28' },
  ],
  risks:       [{ id: 'r1', title: 'Vendor delay', severity: 'critical', project: 'Project Alpha', owner: 'Priya M.', mitigation: 'In progress' }],
  milestones:  [{ id: 'm1', project: 'Project Alpha', name: 'Sprint Review', planned: 'Jan 28', forecast: 'Jan 28', variance: 0, status: 'on-track' }],
  escalations: [{ id: 'e1', title: 'Vendor unresponsive', raisedBy: 'Priya M.', raisedTo: 'Ravi S.', project: 'Project Alpha', status: 'open', daysOpen: 2, description: '' }],
  evidence:    [{ id: 'ev1', title: 'SLA Agreement.pdf', type: 'document', uploadedBy: 'Priya M.', uploadedAt: 'Jan 24', project: 'Project Alpha' }],
}

const SORTED_IDS = ['p2', 'p1'] // red first
const RESET = { focusMode: false, focusProjectId: null, focusProjectList: [], panelHistory: [], activePanel: null }

// ── Visibility ────────────────────────────────────────────────────────────────

describe('FocusMode visibility', () => {
  beforeEach(() => useCommandStore.setState(RESET))

  it('does not render when focusMode=false', () => {
    const { container } = render(<FocusMode data={DATA} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders dialog when focusMode=true', () => {
    useCommandStore.setState({ focusMode: true, focusProjectId: 'p1', focusProjectList: SORTED_IDS })
    render(<FocusMode data={DATA} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

// ── Content ───────────────────────────────────────────────────────────────────

describe('FocusMode content', () => {
  beforeEach(() => useCommandStore.setState({ ...RESET, focusMode: true, focusProjectId: 'p1', focusProjectList: SORTED_IDS }))

  it('renders project name', () => {
    render(<FocusMode data={DATA} />)
    // Project name appears in header and in milestone row — check at least one exists
    expect(screen.getAllByText('Project Alpha').length).toBeGreaterThan(0)
  })

  it('renders progress percentage', () => {
    render(<FocusMode data={DATA} />)
    expect(screen.getAllByText(/78%/).length).toBeGreaterThan(0)
  })

  it('renders next milestone', () => {
    render(<FocusMode data={DATA} />)
    // 'Sprint Review' appears in KPI card and milestone row
    expect(screen.getAllByText('Sprint Review').length).toBeGreaterThan(0)
  })

  it('renders all four section labels', () => {
    render(<FocusMode data={DATA} />)
    ;['Risks', 'Milestones', 'Escalations', 'Evidence'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders progress bar with aria attributes', () => {
    render(<FocusMode data={DATA} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '78')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders position indicator — p1 is index 1 of 2', () => {
    render(<FocusMode data={DATA} />)
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('renders keyboard shortcut strip', () => {
    render(<FocusMode data={DATA} />)
    expect(screen.getByText('Exit')).toBeInTheDocument()
    expect(screen.getByText('Prev project')).toBeInTheDocument()
    expect(screen.getByText('Next project')).toBeInTheDocument()
  })
})

// ── Exit button ───────────────────────────────────────────────────────────────

describe('FocusMode exit button', () => {
  beforeEach(() => useCommandStore.setState({ ...RESET, focusMode: true, focusProjectId: 'p1', focusProjectList: SORTED_IDS }))

  it('Exit button sets focusMode to false', () => {
    render(<FocusMode data={DATA} />)
    fireEvent.click(screen.getByLabelText('Exit focus mode'))
    expect(useCommandStore.getState().focusMode).toBe(false)
  })
})

// ── Prev / Next buttons ───────────────────────────────────────────────────────

describe('FocusMode prev/next buttons', () => {
  beforeEach(() => useCommandStore.setState({ ...RESET, focusMode: true, focusProjectId: 'p1', focusProjectList: SORTED_IDS }))

  it('Next button advances focusProjectId (p1→wraps→p2)', () => {
    render(<FocusMode data={DATA} />)
    fireEvent.click(screen.getByTitle(/Project Kiran →/))
    expect(useCommandStore.getState().focusProjectId).toBe('p2')
  })

  it('Prev button goes to previous focusProjectId (p1→p2)', () => {
    render(<FocusMode data={DATA} />)
    fireEvent.click(screen.getByTitle(/← Project Kiran/))
    expect(useCommandStore.getState().focusProjectId).toBe('p2')
  })
})

// ── Keyboard shortcuts ────────────────────────────────────────────────────────

describe('FocusMode keyboard shortcuts', () => {
  beforeEach(() => useCommandStore.setState({ ...RESET, focusMode: true, focusProjectId: 'p1', focusProjectList: SORTED_IDS }))

  it('Esc exits focus mode', () => {
    render(<FocusMode data={DATA} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useCommandStore.getState().focusMode).toBe(false)
  })

  it('f exits focus mode', () => {
    render(<FocusMode data={DATA} />)
    fireEvent.keyDown(window, { key: 'f' })
    expect(useCommandStore.getState().focusMode).toBe(false)
  })

  it('ArrowRight advances to next project', () => {
    render(<FocusMode data={DATA} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(useCommandStore.getState().focusProjectId).toBe('p2')
  })

  it('ArrowLeft goes to previous project', () => {
    render(<FocusMode data={DATA} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(useCommandStore.getState().focusProjectId).toBe('p2')
  })
})
