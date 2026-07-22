import { Component } from 'react'

/**
 * ZoneErrorBoundary — catches render errors inside a single zone.
 * Prevents one broken zone from crashing the entire dashboard.
 * Shows a minimal inline error state — executive sees the rest of the dashboard.
 */
export class ZoneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error(`[ECC] Zone error in ${this.props.zone ?? 'unknown'}:`, error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface-mid border border-border rounded-sm flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
            <span className="text-micro text-text-secondary uppercase tracking-widest font-medium">
              {this.props.zone ?? 'Zone'}
            </span>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <span className="text-caption text-red-400">Failed to load this zone.</span>
            <button
              className="text-micro text-text-secondary hover:text-text-primary border border-border rounded px-2 py-1 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * AppErrorBoundary — top-level catch for catastrophic failures.
 * Shows a full-screen error with a reload button.
 */
export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ECC] App-level error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-surface-dark gap-4">
          <span className="text-red-400 text-body">Something went wrong loading the dashboard.</span>
          <button
            className="text-caption border border-border rounded px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
