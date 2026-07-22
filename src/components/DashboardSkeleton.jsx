/**
 * DashboardSkeleton — matches the real dashboard layout exactly.
 * Shown during initial data load (isLoading = true).
 * Uses animate-pulse shimmer — no spinners, no blank screens.
 * Layout mirrors App.jsx rows so there is zero layout shift on data arrival.
 */

function SkeletonZone({ height = 'h-40', label }) {
  return (
    <div className="bg-surface-mid border border-border rounded-sm flex flex-col">
      <div className="flex items-center px-5 pt-4 pb-3 border-b border-border">
        <div className="skeleton-line w-24 animate-pulse" />
      </div>
      <div className={`px-5 py-4 flex flex-col gap-3 ${height}`}>
        <div className="skeleton-line w-3/4 animate-pulse" />
        <div className="skeleton-line w-1/2 animate-pulse" />
        <div className="skeleton-line w-2/3 animate-pulse" />
      </div>
    </div>
  )
}

function SkeletonKPIBar() {
  return (
    <div className="bg-surface-mid border border-border rounded-sm p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-surface-light border border-border rounded p-4 flex flex-col gap-2">
            <div className="skeleton-line w-20 animate-pulse" />
            <div className="skeleton-line w-12 h-8 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonProjectGrid() {
  return (
    <div className="bg-surface-mid border border-border rounded-sm flex flex-col">
      <div className="flex items-center px-5 pt-4 pb-3 border-b border-border">
        <div className="skeleton-line w-28 animate-pulse" />
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-dark border-l-4 border-border rounded p-4 flex flex-col gap-2">
              <div className="skeleton-line w-3/4 animate-pulse" />
              <div className="skeleton-line w-full h-1.5 animate-pulse" />
              <div className="skeleton-line w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-dark">
      {/* Header skeleton */}
      <div className="h-14 bg-surface-mid border-b border-border flex items-center justify-between px-6 flex-shrink-0">
        <div className="skeleton-line w-48 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="skeleton-line w-12 animate-pulse" />
          <div className="skeleton-line w-20 animate-pulse" />
          <div className="skeleton-line w-16 animate-pulse" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Row 1 — KPI bar */}
        <SkeletonKPIBar />

        {/* Row 2 — Alerts + Delivery */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8">
            <SkeletonZone height="h-44" />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <SkeletonZone height="h-44" />
          </div>
        </div>

        {/* Row 3 — Project grid */}
        <SkeletonProjectGrid />

        {/* Row 4 — Risk + Resource + Decisions */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4"><SkeletonZone /></div>
          <div className="col-span-12 lg:col-span-4"><SkeletonZone /></div>
          <div className="col-span-12 lg:col-span-4"><SkeletonZone /></div>
        </div>

        {/* Row 5 — Timeline */}
        <SkeletonZone height="h-52" />

        {/* Row 6 — Dependencies + Activity */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7"><SkeletonZone /></div>
          <div className="col-span-12 lg:col-span-5"><SkeletonZone /></div>
        </div>
      </main>
    </div>
  )
}
