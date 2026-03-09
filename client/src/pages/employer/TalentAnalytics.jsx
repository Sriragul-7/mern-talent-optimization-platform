import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Card from '../../components/ui/Card'
import ActivityLineChart from '../../components/charts/ActivityLineChart'
import SkillPieChart from '../../components/charts/SkillPieChart'
import { MOCK_EMPLOYER_STATS, MOCK_TALENT } from '../../utils/mockData'
import { SKILL_COLORS } from '../../utils/helpers'

export default function TalentAnalytics() {
  const stats = MOCK_EMPLOYER_STATS
  const pieData = stats.topSkills.map(s => ({ name: s.name, value: s.count }))

  const uniData = MOCK_TALENT.reduce((acc, s) => {
    const existing = acc.find(a => a.name === s.university)
    if (existing) existing.count++
    else acc.push({ name: s.university, count: 1 })
    return acc
  }, [])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityLineChart data={stats.monthlyActivity} title="New Registrations per Month" />
        <SkillPieChart data={pieData} title="Skill Distribution" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top universities */}
        <Card className="p-5">
          <h3 className="section-title mb-4">Students by University</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={uniData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={95} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {uniData.map((_, i) => <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* CGPA distribution */}
        <Card className="p-5">
          <h3 className="section-title mb-4">CGPA Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.cgpaDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.cgpaDistribution.map((_, i) => <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-5">
        <h3 className="section-title mb-4">Key Analytics Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Avg Skills/Student', value: '4.2', color: 'text-brand-500' },
            { label: 'Students w/ Projects', value: '78%', color: 'text-accent-500' },
            { label: 'Certified Students', value: '63%', color: 'text-emerald-500' },
            { label: 'CGPA > 8.0', value: '32%', color: 'text-amber-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
