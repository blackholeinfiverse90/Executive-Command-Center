import { ActivityItem } from '../cards'
import { ZoneShell } from './ZoneShell'

export function ActivityFeed({ activity }) {
  return (
    <ZoneShell id="zone-activity" label="Activity Feed">
      <div className="overflow-y-auto max-h-40">
        {activity.map((a) => <ActivityItem key={a.id} item={a} />)}
      </div>
    </ZoneShell>
  )
}
