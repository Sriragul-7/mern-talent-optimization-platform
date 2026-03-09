import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { dummySkills, dummyRecommendedSkills, dummyRecommendedProjects } from '../../data/dummy'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

import { FiZap, FiFolder, FiAward, FiTrendingUp } from 'react-icons/fi'

const levelData = [
  { name: "Beginner", count: dummySkills.filter(s => s.level === "Beginner").length },
  { name: "Intermediate", count: dummySkills.filter(s => s.level === "Intermediate").length },
  { name: "Pro", count: dummySkills.filter(s => s.level === "Pro").length },
]
const categoryCount = dummySkills.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc }, {})
const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }))
const PIE_COLORS = ["#2563EB", "#16A34A", "#D97706", "#7C3AED"]

const stats = [
  { label: "Total Skills", value: dummySkills.length, icon: <FiZap />, bg: "#EFF6FF", iconBg: "#DBEAFE", sub: "across 4 categories", lightText: "text-blue-900" },
  { label: "Projects", value: 5, icon: <FiFolder />, bg: "#F5F3FF", iconBg: "#EDE9FE", sub: "2 in progress", lightText: "text-purple-900" },
  { label: "Certifications", value: 3, icon: <FiAward />, bg: "#F0FDF4", iconBg: "#DCFCE7", sub: "2 verified", lightText: "text-green-900" },
  { label: "Profile Score", value: "78%", icon: <FiTrendingUp />, bg: "#FFF7ED", iconBg: "#FED7AA", sub: "Good standing", lightText: "text-orange-900" },
]

export default function StudentDashboard() {
  return (
    <Layout role="student">
      <Header title="Dashboard" />
      <div className="p-6 flex flex-col gap-6 overflow-y-auto">

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl p-5 flex items-start gap-4 shadow-sm dark:bg-slate-800 dark:border-slate-700" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: s.iconBg, color: '#1f2937' }}>{s.icon}</div>
              <div>
                <p className="text-2xl font-display font-bold text-text">{s.value}</p>
                <p className="text-sm font-semibold text-text-muted">{s.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: 'var(--text-muted)' }}>Skills by Level</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={levelData} barSize={48} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }} cursor={{ fill: 'var(--bg)' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: 'var(--text-muted)' }}>Skills by Category</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="45%" cy="50%" outerRadius={80} innerRadius={40}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>Recommended Skills</p>
            {dummyRecommendedSkills.map((skill, i) => (
              <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: i < dummyRecommendedSkills.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{skill.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{skill.reason}</p>
                </div>
                <Button variant="secondary" className="text-xs px-3 py-1.5">+ Add</Button>
              </div>
            ))}
          </Card>

          <Card>
            <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>Recommended Projects</p>
            {dummyRecommendedProjects.map((proj, i) => (
              <div key={i} className="py-3" style={{ borderBottom: i < dummyRecommendedProjects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{proj.title}</p>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{proj.description}</p>
                <div className="flex gap-1 flex-wrap">{proj.stack.map((s, j) => <Badge key={j} label={s} color="blue" />)}</div>
              </div>
            ))}
          </Card>
        </div>

      </div>
    </Layout>
  )
}