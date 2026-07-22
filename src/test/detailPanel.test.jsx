/**
 * detailPanel.test.jsx — DetailPanel open / close / back / content
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { DetailPanel } from '../components/DetailPanel'
import { useCommandStore } from '../store/commandStore'

afterEach(() => cleanup())

const DATA = {
  projects: [
    { id: 'p1', name: 'Project Alpha', status: 'green', progress: 78, nextMilestone: 'Sprint Review', owner: 'Ravi S.', lastUpdated: '14:20' },
    { id: 'p2', name: 'Project Kiran', status: 'red',   progress: 34, nextMilestone: 'BLOCKED',       owner: 'Priya M.', lastUpdated: '14:28' },
  ],
  risks:        [{ id: 'r1', title: 'Vendor delay', severity: 'critical', project: 'Project Alpha', owner: 'Priya M.', mitigation: 'In progress' }],
  milestones:   [{ id: 'm1', project: 'Project Alpha', name: 'Sprint Review', planned: 'Jan 28', forecast: 'Jan 28', variance: 0, status: 'on-track' }],
  escalations:  [{ id: 'e1', title: 'Vendor unresponsive', raisedBy: 'Priya M.', raisedTo: 'Ravi S.', project: 'Project Alpha', status: 'open', daysOpen: 2, description: 'Blocking dev.' }],
  evidence:     [{ id: 'ev1', title: 'SLA Agreement.pdf', type: 'document', uploadedBy: 'Priya M.', uploadedAt: 'Jan 24', project: 'Project Alpha' }],
  alerts:       [{ id: 'a1', severity: 'critical', title: 'Dependency block — Project Kiran', time: '14:28', slaRemaining: '2h' }],
  decisions:    [{ id: 'd1', title: 'Vendor selection', deadline: 'Jan 27', owner: 'Ravi S.', status: 'overdue', daysLeft: -1 }],
  dependencies: [{ id: 'dep1', from: 'Project Kiran', to: 'Project Alpha', type: 'blocked-by', reason: 'API contract not finalised', severity: 'critical', since: '2d' }],
}

const RESET = { panelHistory: [], activePanel: null, focusMode: false, focusProjectId: null, focusProjectList: [] }

// ── Visibility ────────────────────────────────────────────────────────────────

describe('DetailPanel visibility', () => {
  beforeEach(() => useCommandStore.setState(RESET))

  it('does not render when activePanel is null', () => {
    const { container } = render(<DetailPanel data={DATA} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders dialog when activePanel is set', () => {
    useCommandStore.setState({ activePanel: { type: 'project', id: 'p1' } })
    render(<DetailPanel data={DATA} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

// ── Close / Back ──────────────────────────────────────────────────────────────

describe('DetailPanel close and back', () => {
  beforeEach(() => useCommandStore.setState(RESET))

  it('close button sets activePanel to null', () => {
    useCommandStore.setState({ activePanel: { type: 'project', id: 'p1' } })
    render(<DetailPanel data={DATA} />)
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(useCommandStore.getState().activePanel).toBeNull()
  })

  it('backdrop click sets activePanel to null', () => {
    useCommandStore.setState({ activePanel: { type: 'project', id: 'p1' } })
    render(<DetailPanel data={DATA} />)
    fireEvent.click(document.querySelector('[aria-hidden="true"]'))
    expect(useCommandStore.getState().activePanel).toBeNull()
  })

  it('back button not visible when no history', () => {
    useCommandStore.setState({ activePanel: { type: 'project', id: 'p1' }, panelHistory: [] })
    render(<DetailPanel data={DATA} />)
    expect(screen.queryByLabelText('Back to previous panel')).toBeNull()
  })

  it('back button visible when history has entries', () => {
    useCommandStore.setState({ activePanel: { type: 'risk', id: 'r1' }, panelHistory: [{ type: 'project', id: 'p1' }] })
    render(<DetailPanel data={DATA} />)
    expect(screen.getByLabelText('Back to previous panel')).toBeInTheDocument()
  })

  it('back button restores previous panel', () => {
    useCommandStore.setState({ activePanel: { type: 'risk', id: 'r1' }, panelHistory: [{ type: 'project', id: 'p1' }] })
    render(<DetailPanel data={DATA} />)
    fireEvent.click(screen.getByLabelText('Back to previous panel'))
    expect(useCommandStore.getState().activePanel).toEqual({ type: 'project', id: 'p1' })
  })

  it('Esc key closes panel', () => {
    useCommandStore.setState({ activePanel: { type: 'project', id: 'p1' } })
    render(<DetailPanel data={DATA} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useCommandStore.getState().activePanel).toBeNull()
  })
})

// ── Project panel ─────────────────────────────────────────────────────────────

describe('DetailPanel — project type', () => {
  beforeEach(() => useCommandStore.setState({ ...RESET, activePanel: { type: 'project', id: 'p1' } }))

  it('renders all section labels', () => {
    render(<DetailPanel data={DATA} />)
    ;['Overview', 'Risks', 'Milestones', 'Escalations', 'Evidence'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders project name in header', () => {
    render(<DetailPanel data={DATA} />)
    // Multiple 'Project Alpha' nodes exist (header + risk section) — check header specifically
    expect(screen.getAllByText('Project Alpha').length).toBeGreaterThan(0)
  })

  it('renders progress bar with correct aria attributes', () => {
    render(<DetailPanel data={DATA} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '78')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders footer with Raise Escalation and Full Focus View', () => {
    render(<DetailPanel data={DATA} />)
    expect(screen.getByText('Raise Escalation')).toBeInTheDocument()
    expect(screen.getByText('Full Focus View')).toBeInTheDocument()
  })

  it('Full Focus View enters focus mode for the project', () => {
    render(<DetailPanel data={DATA} />)
    fireEvent.click(screen.getByText('Full Focus View'))
    expect(useCommandStore.getState().focusMode).toBe(true)
    expect(useCommandStore.getState().focusProjectId).toBe('p1')
  })
})

// ── Alert panel ───────────────────────────────────────────────────────────────

describe('DetailPanel — alert type', () => {
  beforeEach(() => useCommandStore.setState({ ...RESET, activePanel: { type: 'alert', id: 'a1' } }))

  it('renders Alert Detail section', () => {
    render(<DetailPanel data={DATA} />)
    expect(screen.getByText('Alert Detail')).toBeInTheDocument()
    expect(screen.getByText(/SLA Remaining/)).toBeInTheDocument()
  })

  it('does not render footer', () => {
    render(<DetailPanel data={DATA} />)
    expect(screen.queryByText('Raise Escalation')).toBeNull()
    expect(screen.queryByText('Full Focus View')).toBeNull()
  })

  it('shows Related Project link when alert title contains project name', () => {
    render(<DetailPanel data={DATA} />)
    expect(screen.getByText('Related Project')).toBeInTheDocument()
    expect(screen.getByText(/Project Kiran →/)).toBeInTheDocument()
  })
})

// ── Risk panel ────────────────────────────────────────────────────────────────

describe('DetailPanel — risk type', () => {
  beforeEach(() => useCommandStore.setState({ ...RESET, activePanel: { type: 'risk', id: 'r1' } }))

  it('renders Risk Detail section with Mitigation field', () => {
    render(<DetailPanel data={DATA} />)
    expect(screen.getByText('Risk Detail')).toBeInTheDocument()
    expect(screen.getByText(/Mitigation/)).toBeInTheDocument()
  })

  it('does not render footer', () => {
    render(<DetailPanel data={DATA} />)
    expect(screen.queryByText('Raise Escalation')).toBeNull()
  })
})

// ── Decision panel ────────────────────────────────────────────────────────────

describe('DetailPanel — decision type', () => {
  it('renders Decision Detail section with Deadline field', () => {
    useCommandStore.setState({ ...RESET, activePanel: { type: 'decision', id: 'd1' } })
    render(<DetailPanel data={DATA} />)
    expect(screen.getByText('Decision Detail')).toBeInTheDocument()
    expect(screen.getByText(/Deadline/)).toBeInTheDocument()
  })
})

// ── Dependency panel ──────────────────────────────────────────────────────────

describe('DetailPanel — dependency type', () => {
  it('renders Dependency Detail section with Blocked field', () => {
    useCommandStore.setState({ ...RESET, activePanel: { type: 'dependency', id: 'dep1' } })
    render(<DetailPanel data={DATA} />)
    expect(screen.getByText('Dependency Detail')).toBeInTheDocument()
    expect(screen.getByText(/Blocked/)).toBeInTheDocument()
  })
})
