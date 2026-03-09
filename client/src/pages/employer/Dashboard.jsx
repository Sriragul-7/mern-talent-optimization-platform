import Layout from '../../components/layout/Layout'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { dummySearchResults, dummyEmployer } from '../../data/dummy'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { FiUsers, FiStar, FiFileText, FiActivity } from 'react-icons/fi'

const topUniversities = [
  { name: "IIT Madras", count: 145 },
  { name: "NIT Trichy", count: 120 },
  { name: "Anna Uni", count: 180 },
  { name: "VIT Vellore", count: 156 },
]

const skillDemographics = [
  { name: "React", value: 35 },
  { name: "Python", value: 25 },
  { name: "Node.js", value: 20 },
  { name: "AWS", value: 20 },
]
const PIE_COLORS = ["#2563EB", "#16A34A", "#D97706", "#7C3AED"]

const stats = [
  { label: "Total Talent", value: "2,450", icon: <FiUsers />, bg: "#EFF6FF", iconBg: "#DBEAFE", sub: "+12% this week", iconColor: "#2563EB" },
  { label: "Shortlisted", value: "45", icon: <FiStar />, bg: "#FEF3C7", iconBg: "#FDE68A", sub: "5 interviewing moving closely", iconColor: "#D97706" },
  { label: "Role Matches", value: "128", icon: <FiFileText />, bg: "#F0FDF4", iconBg: "#DCFCE7", sub: "For open positions", iconColor: "#16A34A" },
  { label: "Search Activity", value: "Active", icon: <FiActivity />, bg: "#F3E8FF", iconBg: "#E9D5FF", sub: "3 searches today", iconColor: "#9333EA" },
]

export default function EmployerDashboard() {
  return (
    <Layout role="employer">
      <Header title="Employer Dashboard" subtitle={`Welcome back, ${dummyEmployer.name} 👋`} />
      <div className="p-8 flex flex-col gap-6">

        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl p-5 flex items-start gap-4 shadow-sm dark:bg-slate-800 dark:border-slate-700" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
              <div>
                <p className="text-2xl font-display font-bold text-text">{s.value}</p>
                <p className="text-sm font-semibold text-text-muted">{s.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: 'var(--text-muted)' }}>Talent by University Region</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topUniversities} barSize={48} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }} cursor={{ fill: 'var(--bg)' }} />
                <Bar dataKey="count" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="text-xs font-bold uppercase tracking-wide mb-5" style={{ color: 'var(--text-muted)' }}>Top Resourced Skills</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={skillDemographics} dataKey="value" nameKey="name" cx="45%" cy="50%" outerRadius={80} innerRadius={40}>
                  {skillDemographics.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div>
          <Card>
            <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Recently Highlighted Talent</p>
            </div>
            <div className="flex flex-col gap-4">
              {dummySearchResults.slice(0, 3).map((student, i) => (
                <div key={student.id} className="flex justify-between items-center py-2" style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold dark:bg-blue-900/30 dark:text-blue-400">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{student.name}</p>
                      <p className="text-xs text-text-muted">{student.university} · {student.department}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge label={`CGPA: ${student.cgpa}`} color="blue" />
                    <span className="text-xs text-text-muted font-medium bg-bg px-2 py-1 rounded-md border border-border">Score: {student.profileScore}%</span>
                    <Button variant="secondary" className="text-xs px-3 py-1 ml-2">Review Profile</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </Layout>
  )
}