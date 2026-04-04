import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card'
import { SKILL_COLORS } from '../../utils/helpers'

export default function SkillPieChart({ data = [], title = 'Skills by Category' }) {
  if (!data.length) return null
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <h3 className="section-title mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius={45}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
