import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Card from '../ui/Card'
import { SKILL_COLORS } from '../../utils/helpers'

export default function SkillProgressChart({ data = [] }) {
  if (!data.length) return null
  return (
    <Card className="p-5">
      <h3 className="section-title mb-4">Skill Progress</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }}
            cursor={{ fill: 'rgba(14,165,233,0.05)', radius: 6 }}
          />
          <Bar dataKey="level" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
