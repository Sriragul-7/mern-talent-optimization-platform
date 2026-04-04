import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import Card from '../ui/Card'

export default function ActivityLineChart({ data = [], title = 'Platform Activity' }) {
  if (!data.length) return null
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <h3 className="section-title mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }}
          />
          <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorBrand)" dot={{ fill: '#0ea5e9', r: 3 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
