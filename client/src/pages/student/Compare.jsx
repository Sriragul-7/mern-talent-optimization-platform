import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Users, GraduationCap, FolderKanban, Award, Layers } from 'lucide-react'
import Card from '../../components/ui/Card'
import { studentService } from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const LEVEL_LABEL = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' }

function DeltaBadge({ delta }) {
  if (delta > 0.4)
    return <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3" /> Above avg</span>
  if (delta < -0.4)
    return <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full"><TrendingDown className="w-3 h-3" /> Below avg</span>
  return <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"><Minus className="w-3 h-3" /> At avg</span>
}

function StatCompare({ label, yours, avg, icon: Icon, color }) {
  const delta = typeof yours === 'number' && typeof avg === 'number' ? yours - avg : null
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className={`text-3xl font-extrabold ${color} leading-none`}>{typeof yours === 'number' ? yours : '—'}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">You</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-slate-400 leading-none">{typeof avg === 'number' ? avg.toFixed(1) : '—'}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">Platform avg</p>
        </div>
      </div>
      {delta !== null && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <DeltaBadge delta={delta} />
        </div>
      )}
    </Card>
  )
}

export default function Compare() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    studentService.getCompare()
      .then(res => setData(res.data))
      .catch(() => setError('Could not load comparison data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-500 font-medium">{error}</div>
  )

  const { you, platform, skillComparison = [], roleComparison = [], percentile = 0 } = data || {}

  // Skill level chart — vertical bars, works with any count ≥ 1
  const skillChartData = skillComparison.slice(0, 8).map(s => ({
    skill:    s.skill.length > 13 ? s.skill.slice(0, 13) + '…' : s.skill,
    You:      s.yourLevel,
    Platform: parseFloat(s.platformAvg.toFixed(1)),
  }))

  // Bar: role readiness
  const barData = roleComparison.map(r => ({
    role:    r.role.replace(' Developer', '').replace(' Engineer', '').replace(' Analyst', ''),
    You:     r.yourScore,
    Avg:     r.platformAvg,
  }))

  // Percentile colour
  const pctColor = percentile >= 75 ? 'text-emerald-500' : percentile >= 50 ? 'text-brand-500' : percentile >= 25 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Hero banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-white/60 text-sm font-medium">How you compare</p>
            <h2 className="text-2xl font-bold mt-0.5">Platform Benchmark</h2>
            <p className="text-white/50 text-sm mt-1">
              Compared against{' '}
              <span className="text-brand-300 font-semibold">{(platform?.totalStudents || 0).toLocaleString()}</span>{' '}
              students on SkillBridge
            </p>
          </div>
          {/* Percentile ring */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative w-20 h-20">
              <svg width="80" height="80" className="-rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - percentile / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-white leading-none">{percentile}</span>
                <span className="text-[9px] text-white/60 font-bold">%ile</span>
              </div>
            </div>
            <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Percentile</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCompare label="Skills"   yours={you?.skillCount}   avg={platform?.avgSkills}   icon={Layers}       color="text-brand-500"   />
        <StatCompare label="Projects" yours={you?.projectCount} avg={platform?.avgProjects} icon={FolderKanban} color="text-accent-500"  />
        <StatCompare label="Certs"    yours={you?.certCount}    avg={platform?.avgCerts}    icon={Award}        color="text-emerald-500" />
        <StatCompare label="CGPA"     yours={you?.cgpa}         avg={platform?.avgCgpa}     icon={GraduationCap} color="text-amber-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Role readiness bar */}
        <Card className="p-5">
          <h3 className="section-title mb-0.5">Readiness vs Platform Average</h3>
          <p className="text-xs text-slate-400 mb-4">Your score vs platform average per role (out of 100)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} barGap={3} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="role" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 10, fontSize: 12, color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="You" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="Avg" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={24} fillOpacity={0.45} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Skill-by-skill breakdown */}
      {skillComparison.length > 0 && (
        <Card className="p-5">
          <h3 className="section-title mb-0.5">Your Skills vs Platform Average</h3>
          <p className="text-xs text-slate-400 mb-5">
            How your level compares to all students who have the same skill
          </p>
          <div className="space-y-4">
            {skillComparison.map(s => {
              const delta = s.yourLevel - s.platformAvg
              return (
                <div key={s.skill} className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <div className="w-28 flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{s.skill}</p>
                    <p className="text-[10px] text-slate-400">{s.yourLevelLabel} · {s.studentsWithSkill} students</p>
                  </div>
                  <div className="flex-1 min-w-40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-10 text-right text-slate-400 flex-shrink-0">You</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-500 transition-all duration-700"
                          style={{ width: `${(s.yourLevel / 4) * 100}%` }} />
                      </div>
                      <span className="text-[10px] w-3 text-slate-500 flex-shrink-0">{s.yourLevel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-10 text-right text-slate-400 flex-shrink-0">Avg</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-400/60 transition-all duration-700"
                          style={{ width: `${(s.platformAvg / 4) * 100}%` }} />
                      </div>
                      <span className="text-[10px] w-3 text-slate-500 flex-shrink-0">{s.platformAvg.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <DeltaBadge delta={delta} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}