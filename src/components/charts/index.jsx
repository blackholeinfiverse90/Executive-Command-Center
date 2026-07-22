/**
 * Chart Components — Phase 5 Visualization Strategy
 *
 * Three Recharts visualizations, each justified in visualizationStrategy.js.
 * All charts are minimal — no axis labels in Tier 2, no tooltips,
 * no decorative elements. Shape communicates, not numbers.
 */
import {
  AreaChart, Area, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, XAxis, YAxis, Cell,
  RadialBarChart, RadialBar,
} from 'recharts'

// ─── 1. ConfidenceTrendChart ──────────────────────────────────────────────────
// Strategy: TREND_STRATEGY — 7-day area chart of delivery confidence
// Justification: "Is 94% improving or collapsing?" — trend shape answers in <1s
// A single number cannot show direction. An area chart does.
// Used in: DeliveryZone (Tier 2)
//
// Design:
//   - Area fill not line — area communicates weight/volume of confidence
//   - No axis labels — shape is the message, not the numbers
//   - Single reference line at 80% — the concern threshold
//   - Color driven by trend: green=rising, amber=flat, red=falling
//   - isAnimationActive=false — dashboards must not animate on every refresh

export function ConfidenceTrendChart({ history, trend }) {
  const areaColor =
    trend === 'up'   ? '#388E3C' :
    trend === 'down' ? '#D32F2F' :
                       '#F57C00'

  return (
    <div role="img" aria-label={`Delivery confidence trend over 7 days, currently ${history[history.length - 1]?.value ?? ''}%`}>
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={history} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="conf-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={areaColor} stopOpacity={0.35} />
            <stop offset="95%" stopColor={areaColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <ReferenceLine y={80} stroke="#30363D" strokeDasharray="3 3" />
        <Area
          type="monotone"
          dataKey="value"
          stroke={areaColor}
          strokeWidth={1.5}
          fill="url(#conf-grad)"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  )
}

// ─── 2. MilestoneGantt ───────────────────────────────────────────────────────
// Strategy: TIMELINE_STRATEGY — horizontal bar showing planned vs variance
// Justification: time relationships are spatial — variance visible as bar extension.
// A table forces arithmetic ("Jan 25 vs Jan 28 = 3 days").
// A bar makes the slip visible as physical length.
// Used in: TimelineZone (Tier 2)
//
// Design:
//   - Horizontal bars — project on Y axis, days on X axis
//   - Two stacked segments: base (planned, dark) + variance (colored extension)
//   - Variance color by threshold: 0=green, 1–7=amber, >7=red
//   - No axis labels — relative lengths communicate, not absolute dates

const varianceColor = (v) =>
  v === 0 ? '#388E3C' :
  v <= 7  ? '#F57C00' :
            '#D32F2F'

export function MilestoneGantt({ milestones }) {
  const data = milestones.map((m) => ({
    name: m.project.replace('Project ', ''),
    base: 20,
    variance: m.variance,
  }))

  return (
    <div role="img" aria-label="Milestone variance Gantt chart showing planned vs actual delivery">
    <ResponsiveContainer width="100%" height={milestones.length * 28 + 8}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        barSize={10}
      >
        <YAxis
          dataKey="name"
          type="category"
          width={48}
          tick={{ fill: '#8B949E', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <XAxis type="number" hide />
        <Bar dataKey="base" stackId="a" fill="#21262D" radius={[2, 0, 0, 2]} isAnimationActive={false} />
        <Bar dataKey="variance" stackId="a" radius={[0, 2, 2, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={varianceColor(entry.variance)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}

// ─── 3. PortfolioDonut ───────────────────────────────────────────────────────
// Strategy: PROGRESS_STRATEGY — radial bars showing portfolio health split
// Justification: part-to-whole relationships are clearer as concentric arcs
// than as a linear split bar. Three arcs = three health states at a glance.
// Used in: DeliveryZone (Tier 2)
//
// Design:
//   - Three concentric arcs: on-track (green), at-risk (amber), blocked (red)
//   - Each arc = % of total portfolio
//   - Compact 80×80 — fits beside ForecastStat numbers without dominating

export function PortfolioDonut({ onTrack, atRisk, blocked, total }) {
  const data = [
    { name: 'On Track', value: Math.round((onTrack / total) * 100), fill: '#388E3C' },
    { name: 'At Risk',  value: Math.round((atRisk  / total) * 100), fill: '#F57C00' },
    { name: 'Blocked',  value: Math.round((blocked / total) * 100), fill: '#D32F2F' },
  ]

  return (
    <div role="img" aria-label={`Portfolio health: ${onTrack} on track, ${atRisk} at risk, ${blocked} blocked out of ${total} projects`}>
    <ResponsiveContainer width={80} height={80}>
      <RadialBarChart
        cx="50%" cy="50%"
        innerRadius="35%" outerRadius="100%"
        data={data}
        startAngle={90} endAngle={-270}
        barSize={7}
      >
        <RadialBar dataKey="value" background={{ fill: '#21262D' }} isAnimationActive={false} />
      </RadialBarChart>
    </ResponsiveContainer>
    </div>
  )
}
