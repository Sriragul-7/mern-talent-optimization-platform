import { useState, useEffect } from 'react'
import { Users, Layers, TrendingUp, Building2, GraduationCap, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import { employerService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

export default function EmployerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employerService.getDashboard()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const companyName = user?.companyName || user?.name || 'Your Company'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  const topSkills = stats?.topSkills?.slice(0, 8) || []

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', transform: 'translate(30%, -30%)' }} />
        <p className="text-slate-400 text-sm font-medium mb-0.5">Welcome back</p>
        <h2 className="text-2xl font-bold">{companyName}</h2>
        <p className="text-slate-400 text-sm mt-1">
          <span className="text-brand-400 font-semibold">{(stats?.totalStudents || 0).toLocaleString()}</span> verified students available
          {stats?.avgCgpa ? <span className="ml-3">· Average CGPA <span className="text-emerald-400 font-semibold">{stats.avgCgpa}</span></span> : ''}
        </p>
        <button
          onClick={() => navigate('/employer/search')}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" /> Search Talent
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students"  value={(stats?.totalStudents || 0).toLocaleString()} icon={Users}          gradient="bg-brand-100 dark:bg-brand-900/30"   />
        <StatCard title="Skills Tracked"  value={stats?.activeSkills || 0}                     icon={Layers}         gradient="bg-accent-100 dark:bg-accent-900/30"  />
        <StatCard title="Avg. CGPA"       value={stats?.avgCgpa || '—'}                        icon={TrendingUp}     gradient="bg-emerald-100 dark:bg-emerald-900/30"/>
        <StatCard title="Universities"    value={stats?.universities || 0}                     icon={Building2}      gradient="bg-amber-100 dark:bg-amber-900/30"    />
      </div>

      {/* Top skills on platform */}
      {topSkills.length > 0 && (
        <Card className="p-5">
          <h3 className="section-title mb-4">Most Common Skills on Platform</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 10, fontSize: 12, color: '#fff' }}
                cursor={{ fill: 'rgba(14,165,233,0.06)' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {topSkills.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Quick insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Most In-Demand Skill', value: topSkills[0]?.name || 'React.js', sub: `${topSkills[0]?.count || 0} students`, icon: Layers, color: 'text-brand-500' },
          { label: 'Platform Growth', value: `+${stats?.newThisMonth || 0}`, sub: 'new students this month', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Universities', value: stats?.universities || 0, sub: 'colleges represented', icon: GraduationCap, color: 'text-accent-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className={`text-xl font-bold ${color} leading-none mt-0.5`}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

    </div>
  )
}
