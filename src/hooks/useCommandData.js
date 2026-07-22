import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCommandDataWithFallback } from '../services/adapter'
import { useCommandStore } from '../store/commandStore'

/**
 * useCommandData — production data fetching hook
 *
 * - Calls SETU PMC API via adapter (falls back to mock if unreachable)
 * - Refetches every 30s automatically
 * - Retries up to 2 times on failure (with 1s, 2s backoff)
 * - Fires markRefreshed() on every successful fetch (triggers header pulse)
 * - Exposes dataSource so the UI can signal live vs mock mode
 */
export const useCommandData = () => {
  const markRefreshed = useCommandStore((s) => s.markRefreshed)

  const query = useQuery({
    queryKey:        ['commandData'],
    queryFn:         fetchCommandDataWithFallback,
    refetchInterval: 30_000,
    staleTime:       25_000,
    retry:           2,
    retryDelay:      (attempt) => attempt * 1000,
  })

  useEffect(() => {
    if (query.isSuccess) markRefreshed()
  }, [query.dataUpdatedAt])

  return query
}
