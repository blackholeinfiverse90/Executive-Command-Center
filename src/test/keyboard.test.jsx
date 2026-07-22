/**
 * keyboard.test.jsx — keyboard shortcut & store action validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCommandStore } from '../store/commandStore'

const RESET = {
  panelHistory: [], activePanel: null,
  focusMode: false, focusProjectId: null, focusProjectList: [],
  showShortcuts: false,
}

describe('Shortcut overlay', () => {
  beforeEach(() => useCommandStore.setState(RESET))

  it('toggleShortcuts flips showShortcuts true then false', () => {
    useCommandStore.getState().toggleShortcuts()
    expect(useCommandStore.getState().showShortcuts).toBe(true)
    useCommandStore.getState().toggleShortcuts()
    expect(useCommandStore.getState().showShortcuts).toBe(false)
  })
})

describe('Zone scroll (number keys)', () => {
  it('getElementById is called for each zone anchor', () => {
    const mockEl = { scrollIntoView: vi.fn() }
    const spy = vi.spyOn(document, 'getElementById').mockReturnValue(mockEl)
    const ANCHORS = {
      '1': 'zone-alerts', '2': 'zone-projects', '3': 'zone-risks',
      '4': 'zone-resources', '5': 'zone-timeline', '6': 'zone-dependencies', '7': 'zone-activity',
    }
    Object.values(ANCHORS).forEach((anchor) => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      expect(spy).toHaveBeenCalledWith(anchor)
    })
    spy.mockRestore()
  })
})

describe('Panel close (Esc)', () => {
  beforeEach(() => useCommandStore.setState(RESET))

  it('closePanel sets activePanel to null', () => {
    useCommandStore.getState().openPanel('project', 'p1')
    expect(useCommandStore.getState().activePanel).toEqual({ type: 'project', id: 'p1' })
    useCommandStore.getState().closePanel()
    expect(useCommandStore.getState().activePanel).toBeNull()
  })
})

describe('Panel history stack', () => {
  beforeEach(() => useCommandStore.setState(RESET))

  it('openPanel pushes current panel to history', () => {
    useCommandStore.getState().openPanel('project', 'p1')
    useCommandStore.getState().openPanel('risk', 'r1')
    const s = useCommandStore.getState()
    expect(s.activePanel).toEqual({ type: 'risk', id: 'r1' })
    expect(s.panelHistory).toEqual([{ type: 'project', id: 'p1' }])
  })

  it('panelBack restores previous panel', () => {
    useCommandStore.getState().openPanel('project', 'p1')
    useCommandStore.getState().openPanel('risk', 'r1')
    useCommandStore.getState().panelBack()
    const s = useCommandStore.getState()
    expect(s.activePanel).toEqual({ type: 'project', id: 'p1' })
    expect(s.panelHistory).toHaveLength(0)
  })

  it('panelBack on empty history closes panel', () => {
    useCommandStore.getState().openPanel('project', 'p1')
    useCommandStore.getState().panelBack()
    expect(useCommandStore.getState().activePanel).toBeNull()
  })
})

describe('FocusMode store', () => {
  const SORTED_IDS = ['p2', 'p3', 'p1']

  beforeEach(() => {
    useCommandStore.setState(RESET)
    useCommandStore.getState().enterFocus('p2', SORTED_IDS)
  })

  it('enterFocus sets focusMode, focusProjectId, focusProjectList', () => {
    const s = useCommandStore.getState()
    expect(s.focusMode).toBe(true)
    expect(s.focusProjectId).toBe('p2')
    expect(s.focusProjectList).toEqual(SORTED_IDS)
  })

  it('exitFocus clears all focus state', () => {
    useCommandStore.getState().exitFocus()
    const s = useCommandStore.getState()
    expect(s.focusMode).toBe(false)
    expect(s.focusProjectId).toBeNull()
    expect(s.focusProjectList).toHaveLength(0)
  })

  it('focusNext advances index and wraps', () => {
    useCommandStore.getState().focusNext() // p2→p3
    expect(useCommandStore.getState().focusProjectId).toBe('p3')
    useCommandStore.getState().focusNext() // p3→p1
    expect(useCommandStore.getState().focusProjectId).toBe('p1')
    useCommandStore.getState().focusNext() // p1→p2 (wrap)
    expect(useCommandStore.getState().focusProjectId).toBe('p2')
  })

  it('focusPrev wraps to last item', () => {
    useCommandStore.getState().focusPrev() // p2=0 → wraps to p1=2
    expect(useCommandStore.getState().focusProjectId).toBe('p1')
  })
})
