import clsx from 'clsx'

/**
 * ZoneShell — reusable operational zone wrapper
 *
 * Every zone in the Command Center is wrapped in ZoneShell.
 * This enforces:
 *   - Consistent chrome (bg, border, padding, radius)
 *   - Zone label in uppercase caption style
 *   - Optional badge (alert count, overdue count, etc.)
 *   - Optional zone-level action slot (top-right)
 *   - Semantic aria-label for accessibility
 *
 * Zone identity is defined here — not inside each zone component.
 */
export function ZoneShell({ id, label, badge, badgeColor = 'red', action, children, className }) {
  const badgeColors = {
    red:   'bg-red-900 text-red-300',
    amber: 'bg-amber-900 text-amber-300',
    blue:  'bg-blue-900 text-blue-300',
  }

  return (
    <section
      id={id}
      aria-label={label}
      className={clsx(
        'bg-surface-mid border border-border rounded-sm flex flex-col',
        className
      )}
    >
      {/* Zone header bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-micro text-text-secondary uppercase tracking-widest font-medium">
            {label}
          </span>
          {badge != null && (
            <span className={clsx('text-micro px-1.5 py-0.5 rounded font-semibold', badgeColors[badgeColor])}>
              {badge}
            </span>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">{action}</div>
        )}
      </div>

      {/* Zone content */}
      <div className="flex-1 px-5 py-4 min-h-0">
        {children}
      </div>
    </section>
  )
}
