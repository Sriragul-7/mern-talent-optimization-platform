import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, GraduationCap, FolderKanban, Award, Layers } from 'lucide-react'
import Card from '../../components/ui/Card'
import { studentService } from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

function DeltaBadge({ delta }) {
  if (delta > 0.4) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-900/30">
        <TrendingUp className="h-3 w-3" /> Above avg
      </span>
    )
  }
  if (delta < -0.4) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-500 dark:bg-red-900/30">
        <TrendingDown className="h-3 w-3" /> Below avg
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-800">
      <Minus className="h-3 w-3" /> At avg
    </span>
  )
}

function StatCompare({ label, yours, avg, icon: Icon, color }) {
  const delta = typeof yours === 'number' && typeof avg === 'number' ? yours - avg : null

  return (
    <Card className="h-full p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className={`text-3xl font-extrabold leading-none ${color}`}>{typeof yours === 'number' ? yours : '-'}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase text-slate-400">You</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold leading-none text-slate-400">{typeof avg === 'number' ? avg.toFixed(1) : '-'}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase text-slate-400">Platform avg</p>
        </div>
      </div>
      {delta !== null && (
        <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
          <DeltaBadge delta={delta} />
        </div>
      )}
    </Card>
  )
}

export default function Compare() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentService.getCompare()
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load comparison data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <svg className="h-7 w-7 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  if (error) {
    return <div className="flex h-64 items-center justify-center font-medium text-red-500">{error}</div>
  }

  const { you, platform, skillComparison = [], roleComparison = [], percentile = 0 } = data || {}

  const barData = roleComparison.map((r) => ({
    role: r.role.replace(' Developer', '').replace(' Engineer', '').replace(' Analyst', ''),
    You: r.yourScore,
    Avg: r.platformAvg,
  }))

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="absolute right-0 top-0 h-56 w-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', transform: 'translate(30%,-30%)' }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-white/60">How you compare</p>
            <h2 className="mt-0.5 text-2xl font-bold sm:text-[1.9rem]">Platform Benchmark</h2>
            <p className="mt-1 text-sm text-white/50">
              Compared against{' '}
              <span className="font-semibold text-brand-300">{(platform?.totalStudents || 0).toLocaleString()}</span>{' '}
              students on SkillBridge
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col items-center gap-1">
            <div className="relative h-20 w-20">
              <svg width="80" height="80" className="-rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="white"
                  strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - percentile / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold leading-none text-white">{percentile}</span>
                <span className="text-[9px] font-bold text-white/60">%ile</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Percentile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCompare label="Skills" yours={you?.skillCount} avg={platform?.avgSkills} icon={Layers} color="text-brand-500" />
        <StatCompare label="Projects" yours={you?.projectCount} avg={platform?.avgProjects} icon={FolderKanban} color="text-accent-500" />
        <StatCompare label="Certs" yours={you?.certCount} avg={platform?.avgCerts} icon={Award} color="text-emerald-500" />
        <StatCompare label="CGPA" yours={you?.cgpa} avg={platform?.avgCgpa} icon={GraduationCap} color="text-amber-500" />
      </div>

      <Card className="p-6">
        <div className="mb-5">
          <h3 className="section-title mb-0.5">Readiness vs Platform Average</h3>
          <p className="text-xs text-slate-400">Your score vs platform average per role out of 100</p>
        </div>
        <div className="w-full min-w-0">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} barGap={10} barCategoryGap="18%" margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="role" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 10, fontSize: 12, color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="You" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="Avg" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={36} fillOpacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {skillComparison.length > 0 && (
        <Card className="p-6">
          <div className="mb-5">
            <h3 className="section-title mb-0.5">Your Skills vs Platform Average</h3>
            <p className="text-xs text-slate-400">How your level compares to all students who have the same skill</p>
          </div>
          <div className="space-y-4">
            {skillComparison.map((skill) => {
              const delta = skill.yourLevel - skill.platformAvg
              return (
                <div key={skill.skill} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
                    <div className="w-32 flex-shrink-0">
                      <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{skill.skill}</p>
                      <p className="text-[10px] text-slate-400">{skill.yourLevelLabel} | {skill.studentsWithSkill} students</p>
                    </div>
                    <div className="min-w-40 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-10 flex-shrink-0 text-right text-[10px] text-slate-400">You</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${(skill.yourLevel / 4) * 100}%` }} />
                        </div>
                        <span className="w-3 flex-shrink-0 text-[10px] text-slate-500">{skill.yourLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-10 flex-shrink-0 text-right text-[10px] text-slate-400">Avg</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-violet-400/60 transition-all duration-700" style={{ width: `${(skill.platformAvg / 4) * 100}%` }} />
                        </div>
                        <span className="w-3 flex-shrink-0 text-[10px] text-slate-500">{skill.platformAvg.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <DeltaBadge delta={delta} />
                    </div>
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
