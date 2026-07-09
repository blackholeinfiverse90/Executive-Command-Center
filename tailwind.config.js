/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ── COLOR SEMANTICS (Phase 6) ──────────────────────────────────────────
      // Every color has ONE meaning. See designSystem.js § COLOR_SEMANTICS.
      colors: {
        surface: {
          dark:  '#0D1117',  // page bg, card bg inside zones
          mid:   '#161B22',  // zone bg, panel bg
          light: '#21262D',  // hover states, active rows
        },
        border: '#30363D',   // single border color — all dividers
        text: {
          primary:   '#E6EDF3',  // titles, values, labels
          secondary: '#8B949E',  // timestamps, owners, units
        },
        status: {
          red:   '#D32F2F',  // BLOCKED / critical / overdue
          amber: '#F57C00',  // AT-RISK / high / pending
          green: '#388E3C',  // ON-TRACK / healthy / resolved
          blue:  '#1565C0',  // informational / focus ring / links
        },
      },

      // ── TYPOGRAPHY HIERARCHY (Phase 6) ────────────────────────────────────
      // 6-level scale. Each level has ONE purpose. See designSystem.js § TYPOGRAPHY.
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '1',   fontWeight: '700' }],  // hero KPI numbers
        h1:      ['24px', { lineHeight: '1.2', fontWeight: '600' }],  // page title, focus mode
        h2:      ['18px', { lineHeight: '1.3', fontWeight: '600' }],  // section headings
        body:    ['14px', { lineHeight: '1.4', fontWeight: '400' }],  // card titles, row labels
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400' }],  // secondary info, timestamps
        micro:   ['10px', { lineHeight: '1.2', fontWeight: '500' }],  // zone labels, badges, kbd
      },

      // ── SPACING SCALE (Phase 6) ────────────────────────────────────────────
      // Base unit: 4px. All spacing is a multiple of 4.
      // Tailwind's default scale already covers most of these — only extend gaps.
      spacing: {
        '18': '72px',   // used for CommandHeader height
        '88': '352px',  // DetailPanel min-height reference
      },

      // ── GRID SYSTEM (Phase 6) ─────────────────────────────────────────────
      maxWidth: {
        dashboard: '1600px',  // centers on ultra-wide monitors
      },

      // ── Z-INDEX TABLE (Phase 6) ────────────────────────────────────────────
      // All z-index values declared here. Never use arbitrary z-index in components.
      zIndex: {
        sticky:     '10',   // CommandHeader
        backdrop:   '49',   // panel-backdrop
        panel:      '50',   // DetailPanel
        focus:      '55',   // FocusMode
        overlay:    '60',   // shortcut overlay, modals
      },

      // ── ANIMATION DURATIONS (Phase 6) ─────────────────────────────────────
      // Consistent motion timing. See globals.css for keyframe definitions.
      transitionDuration: {
        '150': '150ms',  // fade-in (FocusMode)
        '200': '200ms',  // slide-in-right (DetailPanel)
        '600': '600ms',  // refresh-pulse (CommandHeader)
      },

      // ── DASHBOARD RHYTHM (Phase 6) ────────────────────────────────────────
      borderRadius: {
        sm: '2px',   // zone shells — subtle, not pill
        DEFAULT: '4px', // cards, badges, inputs
      },
    },
  },
  plugins: [],
}
