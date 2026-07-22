/**
 * setuApi.js — SETU PMC Runtime API client
 *
 * Thin fetch wrapper. No business logic here.
 * Every function returns raw SETU schema objects.
 * Normalization to dashboard shapes happens in adapter.js.
 *
 * SETU API base: http://127.0.0.1:8000/api/v1
 * Docs:          http://127.0.0.1:8000/docs
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'
const TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 8000)

// ── Fetch with timeout ────────────────────────────────────────────────────────

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new SetuApiError(res.status, `${res.statusText}${body ? `: ${body}` : ''}`, url)
    }
    return res.json()
  } catch (err) {
    if (err.name === 'AbortError') throw new SetuApiError(408, `Request timed out after ${TIMEOUT}ms`, url)
    if (err instanceof SetuApiError) throw err
    throw new SetuApiError(0, err.message, url)
  } finally {
    clearTimeout(timer)
  }
}

// ── Typed error ───────────────────────────────────────────────────────────────

export class SetuApiError extends Error {
  constructor(status, message, url) {
    super(message)
    this.name  = 'SetuApiError'
    this.status = status
    this.url    = url
  }
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export const setuApi = {
  /** GET /health — liveness check */
  health: () =>
    fetchWithTimeout(`${BASE_URL}/health`),

  /** GET /projects — all projects */
  projects: () =>
    fetchWithTimeout(`${BASE_URL}/projects`),

  /** GET /projects/:id — single project */
  project: (id) =>
    fetchWithTimeout(`${BASE_URL}/projects/${id}`),

  /** GET /projects/:id/milestones — milestones for a project */
  milestones: (projectId) =>
    fetchWithTimeout(`${BASE_URL}/projects/${projectId}/milestones`),

  /** GET /projects/:id/tasks — all tasks for a project */
  projectTasks: (projectId) =>
    fetchWithTimeout(`${BASE_URL}/projects/${projectId}/tasks`),

  /** GET /tasks/:id — single task */
  task: (id) =>
    fetchWithTimeout(`${BASE_URL}/tasks/${id}`),

  /** GET /tasks/:id/assignments — assignments for a task */
  assignments: (taskId) =>
    fetchWithTimeout(`${BASE_URL}/tasks/${taskId}/assignments`),

  /** GET /ready — readiness check */
  ready: () =>
    fetchWithTimeout(`${BASE_URL}/ready`),
}
