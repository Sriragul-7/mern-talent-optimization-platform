import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layers, FolderKanban, Award, User, Sparkles, ArrowRight, Code2, Cloud, Target, Zap } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import SkillRadarChart from '../../components/charts/SkillRadarChart'
import SkillProgressChart from '../../components/charts/SkillProgressChart'
import ActivityLineChart from '../../components/charts/ActivityLineChart'
import SkillPieChart from '../../components/charts/SkillPieChart'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { studentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const REC_ICONS = { code: Code2, cloud: Cloud, award: Award, user: User }
const REC_COLORS = { high: 'red', medium: 'amber', low: 'blue' }
const REC_GRADIENTS = {
  skill:   'from-brand-500 to-brand-700',
  project: 'from-accent-500 to-accent-700',
  cert:    'from-emerald-500 to-emerald-700',
  profile: 'from-amber-500 to-amber-700',
}

const GRADE_COLOR = {
  emerald: '#10b981', brand: '#0ea5e9', blue: '#3b82f6', amber: '#f59e0b', red: '#ef4444'
}

function MiniScoreRing({ score, color }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="white" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s ease' }} />
    </svg>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentService.getDashboardStats(),
      studentService.getRecommendations(),
    ]).then(([statsRes, recsRes]) => {
      setStats(statsRes.data)
      setRecs(recsRes.data)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  const s = stats || {}

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome banner — now shows readiness score */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 right-16 w-40 h-40 bg-white/5 rounded-full translate-y-10" />
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-sm font-medium">{greeting} 👋</p>
            <h2 className="text-2xl font-bold mt-0.5">{user?.name || 'Student'}</h2>
            <p className="text-white/60 text-sm mt-1">Profile is {s.profileCompletion ?? 0}% complete</p>
            <ProgressBar value={s.profileCompletion ?? 0} max={100} showValue={false} color="brand" size="sm" className="mt-3 max-w-xs" />

            {s.readinessRole && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 text-xs font-semibold">
                <Zap className="w-3 h-3" />
                Best fit: <span className="font-bold">{s.readinessRole}</span>
                <Link to="/student/readiness" className="ml-1 underline opacity-80 hover:opacity-100">View →</Link>
              </div>
            )}
          </div>

          {/* Readiness score ring */}
          {s.readinessScore !== undefined && (
            <Link to="/student/readiness" className="flex-shrink-0 flex flex-col items-center group">
              <div className="relative">
                <MiniScoreRing score={s.readinessScore} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-white leading-none">{s.readinessScore}</span>
                  <span className="text-[9px] text-white/70">/100</span>
                </div>
              </div>
              <span className="text-[10px] text-white/70 mt-1 font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
                Readiness
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Skills"         value={s.skills ?? 0}              icon={Layers}       subtitle="Active skills"  gradient="bg-brand-100 dark:bg-brand-900/30" trend="up" trendValue="+2 this month" />
        <StatCard title="Projects"       value={s.projects ?? 0}            icon={FolderKanban} subtitle="In portfolio"   gradient="bg-accent-100 dark:bg-accent-900/30" />
        <StatCard title="Certifications" value={s.certifications ?? 0}      icon={Award}        subtitle="Earned"         gradient="bg-emerald-100 dark:bg-emerald-900/30" />
        <StatCard title="Readiness"      value={`${s.readinessScore ?? 0}`} icon={Target}       subtitle={s.readinessGrade?.label || 'Score'} gradient="bg-amber-100 dark:bg-amber-900/30" />
      </div>

      {/* Role fit mini-table */}
      {(s.allRoles || []).length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Your Top Role Matches</h3>
            <Link to="/student/readiness" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
              Full Analysis →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {s.allRoles.slice(0, 3).map((r, i) => (
              <div key={r.role} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                <span className="text-sm font-bold text-slate-400">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{r.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.total}%`, background: GRADE_COLOR[r.grade?.color] || '#0ea5e9' }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{r.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkillRadarChart data={s.skillDistribution || []} />
        <SkillPieChart data={s.skillsByCategory || []} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityLineChart data={s.skillProgress || []} title="Skill Growth Over Time" />
        <SkillProgressChart data={s.skillProgressBars || []} />
      </div>

      {/* Recommendations */}
      {recs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-brand-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="section-title">Recommendations</h2>
            </div>
            <Link to="/student/action-plan">
              <Badge variant="purple" className="cursor-pointer hover:opacity-80">View Action Plan →</Badge>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recs.map(rec => {
              const Icon = REC_ICONS[rec.icon] || Sparkles
              return (
                <Card key={rec.id} hover className="p-5 flex gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${REC_GRADIENTS[rec.type] || REC_GRADIENTS.skill} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{rec.title}</p>
                      <Badge variant={REC_COLORS[rec.priority]} className="flex-shrink-0 capitalize">{rec.priority}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rec.description}</p>
                    <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:gap-2 transition-all">
                      {rec.action} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/student/skills',      label: 'Add Skill',     icon: Layers,       color: 'text-brand-500' },
          { to: '/student/projects',    label: 'Add Project',   icon: FolderKanban, color: 'text-accent-500' },
          { to: '/student/readiness',   label: 'Readiness',     icon: Target,       color: 'text-emerald-500' },
          { to: '/student/action-plan', label: 'Action Plan',   icon: Zap,          color: 'text-amber-500' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}>
            <Card hover className="p-4 flex flex-col items-center gap-2 text-center cursor-pointer">
              <Icon className={`w-6 h-6 ${color}`} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
