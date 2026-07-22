/**
 * staleWarning.test.jsx — F15 Stale Data Warning
 *
 * Validates:
 *   1. Timestamp is NOT amber when data is fresh (< 2 min old)
 *   2. Timestamp IS amber when lastRefreshed is > 2 minutes ago
 *   3. Stale warning shows ⚠ prefix
 *   4. Warning clears when lastRefreshed is reset to now
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { CommandHeader } from '../components/zones/CommandHeader'
import { useCommandStore } from '../store/commandStore'

afterEach(() => cleanup())

const PROPS = {
  health: 'green',
  alertCount: 0,
  lastUpdated: '14:20',
  deliveryConfidence: 94,
  confidenceTrend: 'up',
  dataSource: 'mock-fallback',
}

const RESET = {
  isRefreshPulsing: false,
  lastRefreshed: null,
  showShortcuts: false,
}

describe('F15 — Stale Data Warning', () => {
  beforeEach(() => useCommandStore.setState(RESET))

  it('timestamp is not amber when data is fresh', () => {
    useCommandStore.setState({ lastRefreshed: new Date() })
    render(<CommandHeader {...PROPS} />)
    const el = screen.getByLabelText(/Last updated/)
    expect(el.className).not.toContain('text-amber-400')
    expect(el.textContent).not.toContain('⚠')
  })

  it('timestamp is amber when lastRefreshed is > 2 minutes ago', () => {
    const staleTime = new Date(Date.now() - 3 * 60 * 1000) // 3 minutes ago
    useCommandStore.setState({ lastRefreshed: staleTime })
    render(<CommandHeader {...PROPS} />)
    const el = screen.getByLabelText(/Last updated/)
    expect(el.className).toContain('text-amber-400')
  })

  it('shows ⚠ prefix when stale', () => {
    useCommandStore.setState({ lastRefreshed: new Date(Date.now() - 3 * 60 * 1000) })
    render(<CommandHeader {...PROPS} />)
    expect(screen.getByText(/⚠/)).toBeInTheDocument()
  })

  it('no stale warning when lastRefreshed is null', () => {
    useCommandStore.setState({ lastRefreshed: null })
    render(<CommandHeader {...PROPS} />)
    const el = screen.getByLabelText(/Last updated/)
    expect(el.className).not.toContain('text-amber-400')
  })

  it('clears stale warning when lastRefreshed resets to now', () => {
    // Start stale
    useCommandStore.setState({ lastRefreshed: new Date(Date.now() - 3 * 60 * 1000) })
    const { rerender } = render(<CommandHeader {...PROPS} />)
    expect(screen.getByLabelText(/Last updated/).className).toContain('text-amber-400')

    // Simulate refresh — wrap store update in act so React flushes the setInterval state
    act(() => useCommandStore.setState({ lastRefreshed: new Date() }))
    rerender(<CommandHeader {...PROPS} />)
    expect(screen.getByLabelText(/Last updated/).className).not.toContain('text-amber-400')
  })
})
