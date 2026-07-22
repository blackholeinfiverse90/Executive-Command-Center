/**
 * interactions.test.jsx — click / double-click / keyboard interaction flows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import {
  ProjectHealthCard, AlertCard, RiskCard, DecisionCard, DependencyCard,
} from '../components/cards'

afterEach(() => cleanup())

const PROJECT = {
  id: 'p1', name: 'Project Alpha', status: 'green',
  progress: 78, nextMilestone: 'Sprint Review', owner: 'Ravi S.', lastUpdated: '14:20',
}
const ALERT = {
  id: 'a1', severity: 'critical',
  title: 'Dependency block — Project Kiran', time: '14:28', slaRemaining: '2h',
}
const RISK = {
  id: 'r1', title: 'Vendor delay', severity: 'critical',
  project: 'Project Kiran', owner: 'Priya M.', mitigation: 'In progress',
}
const DECISION = {
  id: 'd1', title: 'Vendor selection', deadline: 'Jan 27',
  owner: 'Ravi S.', status: 'overdue', daysLeft: -1,
}
const DEP = {
  id: 'dep1', from: 'Project Kiran', to: 'Project Alpha',
  type: 'blocked-by', reason: 'API contract not finalised', severity: 'critical', since: '2d',
}

// ── ProjectHealthCard ─────────────────────────────────────────────────────────

describe('ProjectHealthCard', () => {
  it('calls onClick on single click', () => {
    const onClick = vi.fn()
    render(<ProjectHealthCard project={PROJECT} onClick={onClick} onDoubleClick={vi.fn()} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(PROJECT)
  })

  it('calls onDoubleClick on double-click', () => {
    const onDoubleClick = vi.fn()
    render(<ProjectHealthCard project={PROJECT} onClick={vi.fn()} onDoubleClick={onDoubleClick} />)
    fireEvent.dblClick(screen.getByRole('button'))
    expect(onDoubleClick).toHaveBeenCalledWith(PROJECT)
  })

  it('calls onClick on Enter key', () => {
    const onClick = vi.fn()
    render(<ProjectHealthCard project={PROJECT} onClick={onClick} onDoubleClick={vi.fn()} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledWith(PROJECT)
  })

  it('calls onClick on Space key', () => {
    const onClick = vi.fn()
    render(<ProjectHealthCard project={PROJECT} onClick={onClick} onDoubleClick={vi.fn()} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
    expect(onClick).toHaveBeenCalledWith(PROJECT)
  })

  it('renders BLOCKED state visually distinct', () => {
    const blocked = { ...PROJECT, nextMilestone: 'BLOCKED', status: 'red' }
    render(<ProjectHealthCard project={blocked} onClick={vi.fn()} onDoubleClick={vi.fn()} />)
    expect(screen.getByText('⊘ BLOCKED')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    render(<ProjectHealthCard project={PROJECT} onClick={vi.fn()} onDoubleClick={vi.fn()} />)
    expect(document.querySelector('[style*="width: 78%"]')).toBeInTheDocument()
  })
})

// ── AlertCard ─────────────────────────────────────────────────────────────────

describe('AlertCard', () => {
  it('calls onClick on click', () => {
    const onClick = vi.fn()
    render(<AlertCard alert={ALERT} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(ALERT)
  })

  it('calls onClick on Enter key', () => {
    const onClick = vi.fn()
    render(<AlertCard alert={ALERT} onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledWith(ALERT)
  })

  it('renders SLA remaining', () => {
    render(<AlertCard alert={ALERT} onClick={vi.fn()} />)
    expect(screen.getByText(/SLA: 2h/)).toBeInTheDocument()
  })
})

// ── RiskCard ──────────────────────────────────────────────────────────────────

describe('RiskCard', () => {
  it('calls onClick on click when provided', () => {
    const onClick = vi.fn()
    render(<RiskCard risk={RISK} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(RISK)
  })

  it('renders without onClick — no button role', () => {
    render(<RiskCard risk={RISK} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Vendor delay')).toBeInTheDocument()
  })

  it('shows mitigation in amber when Pending', () => {
    render(<RiskCard risk={{ ...RISK, mitigation: 'Pending' }} />)
    expect(screen.getByText('Pending').className).toContain('text-amber-400')
  })
})

// ── DecisionCard ──────────────────────────────────────────────────────────────

describe('DecisionCard', () => {
  it('calls onClick on click', () => {
    const onClick = vi.fn()
    render(<DecisionCard decision={DECISION} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(DECISION)
  })

  it('shows OVERDUE badge', () => {
    render(<DecisionCard decision={DECISION} onClick={vi.fn()} />)
    expect(screen.getByText('OVERDUE')).toBeInTheDocument()
  })

  it('shows days left for pending decisions', () => {
    render(<DecisionCard decision={{ ...DECISION, status: 'pending', daysLeft: 3 }} onClick={vi.fn()} />)
    expect(screen.getByText('3d left')).toBeInTheDocument()
  })
})

// ── DependencyCard ────────────────────────────────────────────────────────────

describe('DependencyCard', () => {
  it('calls onClick on click', () => {
    const onClick = vi.fn()
    render(<DependencyCard dep={DEP} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(DEP)
  })

  it('renders BLOCKED BY label', () => {
    render(<DependencyCard dep={DEP} onClick={vi.fn()} />)
    expect(screen.getByText('BLOCKED BY')).toBeInTheDocument()
  })
})
