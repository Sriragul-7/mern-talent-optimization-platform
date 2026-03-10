import { useState, useEffect, useRef } from 'react'
import { Rocket, BookOpen, FolderKanban, Award, User, ExternalLink, TrendingUp } from 'lucide-react'
import { studentService } from '../../services/api'

const ROLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Data Scientist', 'ML Engineer', 'Data Engineer',
  'DevOps Engineer', 'Mobile Developer', 'Android Developer',
  'iOS Developer', 'UI/UX Designer', 'Cybersecurity Analyst',
]

const CAT = {
  skill:   { icon: BookOpen,     bg: 'bg-sky-500',     label: 'Learn Skill'   },
  project: { icon: FolderKanban, bg: 'bg-violet-500',  label: 'Build Project' },
  cert:    { icon: Award,        bg: 'bg-amber-500',   label: 'Earn Cert'     },
  profile: { icon: User,         bg: 'bg-emerald-500', label: 'Update Profile'},
}

const EFFORT_CLASS = {
  Low:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  High:   'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
}

const WEEK_LABELS = {
  1: 'Week 1 — Quick Wins',
  2: 'Week 2 — Build Momentum',
  3: 'Week 3 — Level Up',
  4: 'Week 4 — Finish Strong',
}

export default function ActionPlan() {
  const [role, setRole]       = useState(ROLES[0])
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = async (r, initial = false) => {
    if (!initial) setBusy(true)
    setError('')
    try {
      const res = await studentService.getActionPlan(r)
      if (mountedRef.current) setData(res.data)
    } catch {
      if (mountedRef.current) setError('Could not load action plan.')
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setBusy(false)
      }
    }
  }

  useEffect(() => { load(role, true) }, []) // eslint-disable-line

  const changeRole = r => {
    if (r === role || busy) return
    setRole(r)
    load(r)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => load(role, true)}
        className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
        Retry
      </button>
    </div>
  )

  const steps  = data?.steps || []
  const byWeek = steps.reduce((acc, s) => {
    const w = s.week || 1
    if (!acc[w]) acc[w] = []
    acc[w].push(s)
    return acc
  }, {})

  const SCORE_COLOR = s => s >= 85 ? '#10b981' : s >= 70 ? '#0ea5e9' : s >= 55 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-5">
      {/* Role selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">30-Day Action Plan</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Pick a role — we'll show you the highest-impact steps to boost your score.
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => (
            <button key={r} onClick={() => changeRole(r)} disabled={busy}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-60 ${
                role === r
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-600'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Score projection */}
      {data && (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-opacity duration-200 ${busy ? 'opacity-40' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" /> Score Projection
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{data.currentScore ?? 0}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Current</p>
            </div>
            <div className="flex-1 relative h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="absolute left-0 top-0 h-full rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${data.currentScore}%`, transition: 'width 0.8s ease' }} />
              <div className="absolute top-0 h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-400"
                style={{ left: `${data.currentScore}%`, width: `${(data.potentialScore ?? 0) - (data.currentScore ?? 0)}%`, transition: 'width 0.8s ease 0.2s' }} />
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-extrabold text-emerald-500">
                +{(data.potentialScore ?? 0) - (data.currentScore ?? 0)}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Gain</p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-extrabold text-brand-500">{data.potentialScore ?? 0}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Target</p>
            </div>
          </div>
        </div>
      )}

      {/* Steps by week */}
      <div className={`space-y-5 transition-opacity duration-200 ${busy ? 'opacity-40 pointer-events-none' : ''}`}>
        {Object.entries(byWeek)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([week, weekSteps]) => (
            <div key={week}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  W{week}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {WEEK_LABELS[week] || `Week ${week}`}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-3">
                {weekSteps.map(step => {
                  const meta = CAT[step.category] || CAT.skill
                  const Icon = meta.icon
                  return (
                    <div key={step.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">#{step.rank}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{step.title}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${EFFORT_CLASS[step.effort] || EFFORT_CLASS.Medium}`}>
                                {step.effort} effort
                              </span>
                              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                +{step.impact} pts
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                            {step.description}
                          </p>
                          {step.resources?.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {step.resources.map((res, i) => (
                                <a key={i} href={res.url}
                                  target={res.url.startsWith('/') ? '_self' : '_blank'}
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                  {res.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
      </div>

      {steps.length === 0 && !busy && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <Rocket className="w-10 h-10 text-brand-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 dark:text-slate-200">No action items needed!</p>
          <p className="text-sm text-slate-400 mt-1">You're already strong for this role. Check your Readiness Score.</p>
        </div>
      )}
    </div>
  )
}
