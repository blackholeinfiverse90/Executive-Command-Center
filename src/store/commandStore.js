import { create } from 'zustand'

/**
 * commandStore — UX state for the Executive Command Center
 *
 * Manages:
 *   - Panel history stack (UX Principle 2: context preservation)
 *   - Focus mode + project switcher (UX Principle 7)
 *   - Last refreshed timestamp (UX Principle 9: data freshness)
 *   - Keyboard shortcut overlay visibility (UX Principle 10)
 */
export const useCommandStore = create((set, get) => ({
  // ── Panel state (L2 DetailPanel) ──────────────────────────────────────────
  // Stack-based history: each openPanel() pushes, back() pops
  // Enables: Risk inside Project panel → back → Project panel
  panelHistory: [],   // [{ type, id }, ...]
  activePanel: null,  // { type, id } — current panel, null = closed

  openPanel: (type, id) => set((s) => ({
    panelHistory: s.activePanel ? [...s.panelHistory, s.activePanel] : s.panelHistory,
    activePanel: { type, id },
  })),

  // Back: pop history stack, restore previous panel
  panelBack: () => set((s) => {
    const history = [...s.panelHistory]
    const prev = history.pop() ?? null
    return { panelHistory: history, activePanel: prev }
  }),

  closePanel: () => set({ activePanel: null, panelHistory: [] }),

  // ── Focus mode state (L3 FocusMode) ──────────────────────────────────────
  focusMode: false,
  focusProjectId: null,
  focusProjectList: [],  // severity-sorted project ids for prev/next switcher

  enterFocus: (projectId, sortedIds = []) => set({
    focusMode: true,
    focusProjectId: projectId,
    focusProjectList: sortedIds,
  }),

  exitFocus: () => set({ focusMode: false, focusProjectId: null, focusProjectList: [] }),

  // Navigate to prev/next project in FocusMode without exiting
  focusNext: () => set((s) => {
    const list = s.focusProjectList
    if (!list.length) return {}
    const idx = list.indexOf(s.focusProjectId)
    const next = list[(idx + 1) % list.length]
    return { focusProjectId: next }
  }),

  focusPrev: () => set((s) => {
    const list = s.focusProjectList
    if (!list.length) return {}
    const idx = list.indexOf(s.focusProjectId)
    const prev = list[(idx - 1 + list.length) % list.length]
    return { focusProjectId: prev }
  }),

  // ── Data freshness (UX Principle 9) ──────────────────────────────────────
  lastRefreshed: null,       // Date — set on each successful data fetch
  isRefreshPulsing: false,   // true for 600ms after refresh — triggers CSS pulse

  markRefreshed: () => {
    set({ lastRefreshed: new Date(), isRefreshPulsing: true })
    setTimeout(() => set({ isRefreshPulsing: false }), 700)
  },

  // ── Keyboard shortcut overlay (UX Principle 10) ──────────────────────────
  showShortcuts: false,
  toggleShortcuts: () => set((s) => ({ showShortcuts: !s.showShortcuts })),
}))
