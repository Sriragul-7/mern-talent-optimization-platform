import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card'

export default function SkillRadarChart({ data = [] }) {
  if (!data.length) return null
  return (
    <Card className="p-5">
      <h3 className="section-title mb-4">Skill Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <PolarGrid stroke="var(--border-color)" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
          <Radar
            name="Level"
            dataKey="value"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  )
}
