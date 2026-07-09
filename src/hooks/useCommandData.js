import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCommandData } from '../services/mockData'
import { useCommandStore } from '../store/commandStore'

/**
 * useCommandData — data fetching hook with refresh signal
 *
 * UX Principle 9: Data Freshness
 *   - Refetches every 30s automatically
 *   - Fires markRefreshed() on every successful fetch
 *   - markRefreshed() sets lastRefreshed timestamp + triggers CSS pulse
 */
export const useCommandData = () => {
  const markRefreshed = useCommandStore((s) => s.markRefreshed)

  const query = useQuery({
    queryKey: ['commandData'],
    queryFn: fetchCommandData,
    refetchInterval: 30_000,
    staleTime: 25_000,
  })

  useEffect(() => {
    if (query.isSuccess) markRefreshed()
  }, [query.dataUpdatedAt]) // fires on every successful refetch

  return query
}
