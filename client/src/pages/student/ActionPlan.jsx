import { useState, useEffect } from 'react'
import { Rocket, BookOpen, FolderKanban, Award, User, ExternalLink, ChevronRight, TrendingUp } from 'lucide-react'
import Card from '../../components/ui/Card'
import { studentService } from '../../services/api'

const ROLE_LIST = [
  'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
  'Mobile Developer', 'Backend Developer', 'Frontend Developer',
]

const CAT_META = {
  skill:   { icon: BookOpen,      color: 'brand',   bg: 'bg-brand-500',   label: 'Learn Skill'  },
  project: { icon: FolderKanban,  color: 'accent',  bg: 'bg-accent-500',  label: 'Build Project' },
  cert:    { icon: Award,         color: 'amber',   bg: 'bg-amber-500',   label: 'Earn Cert'    },
  profile: { icon: User,          color: 'emerald', bg: 'bg-emerald-500', label: 'Update Profile'},
}

const EFFORT_BADGE = {
  Low:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  High:   'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
}

const WEEK_LABELS = { 1: 'Week 1 — Quick Wins', 2: 'Week 2 — Build Momentum', 3: 'Week 3 — Level Up', 4: 'Week 4 — Finish Strong' }

function ScoreDelta({ current, potential }) {
  const gain = potential - current
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{current}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current</p>
      </div>
      <div className="flex-1 relative h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="absolute left-0 top-0 h-full rounded-full bg-slate-300 dark:bg-slate-600"
          style={{ width: `${current}%`, transition: 'width 0.8s ease' }} />
        <div className="absolute top-0 h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-400"
          style={{ left: `${current}%`, width: `${gain}%`, transition: 'width 0.8s ease 0.2s' }} />
      </div>
      <div className="text-center">
        <p className="text-2xl font-extrabold text-emerald-500">+{gain}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Potential</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-extrabold text-brand-500">{potential}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Target</p>
      </div>
    </div>
  )
}

export default function ActionPlan() {
  const [role, setRole] = useState(ROLE_LIST[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  const fetch = async (r) => {
    try {
      const res = await studentService.getActionPlan(r)
      setData(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetch(role).finally(() => setLoading(false)) }, [])

  const handleRole = async (r) => {
    if (r === role) return
    setRole(r)
    setSwitching(true)
    await fetch(r)
    setSwitching(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  const steps = data?.steps || []
  const byWeek = steps.reduce((acc, s) => {
    const w = s.week || 1
    if (!acc[w]) acc[w] = []
    acc[w].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-5">

      {/* Role selector */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-5 h-5 text-brand-500" />
          <h3 className="section-title">Your 30-Day Action Plan</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Select a target role — we'll generate a personalized, prioritised plan to maximize your readiness score.
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLE_LIST.map(r => (
            <button key={r} onClick={() => handleRole(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                role === r
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
              }`}
            >{r}</button>
          ))}
        </div>
      </Card>

      {/* Score projection */}
      {data && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" /> Score Projection
            </h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              data.grade?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              data.grade?.color === 'brand'   ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' :
              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              Currently: {data.grade?.label}
            </span>
          </div>
          <ScoreDelta current={data.currentScore ?? 0} potential={data.potentialScore ?? 0} />
          <p className="text-xs text-slate-400 mt-3 text-center">
            Complete all {steps.length} steps below to reach a score of <strong className="text-brand-500">{data.potentialScore}</strong>
          </p>
        </Card>
      )}

      {/* Steps by week */}
      {Object.entries(byWeek)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([week, weekSteps]) => (
          <div key={week}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                W{week}
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {WEEK_LABELS[week] || `Week ${week}`}
              </h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="space-y-3">
              {weekSteps.map((step, i) => {
                const meta = CAT_META[step.category] || CAT_META.skill
                const Icon = meta.icon
                return (
                  <Card key={step.id} hover className="p-5">
                    <div className="flex gap-4">
                      {/* Rank + icon */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">#{step.rank}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{step.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${EFFORT_BADGE[step.effort] || EFFORT_BADGE.Medium}`}>
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

                        {/* Resources */}
                        {step.resources?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((res, ri) => (
                              <a key={ri} href={res.url}
                                target={res.url.startsWith('/') ? '_self' : '_blank'}
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {res.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0 self-center" />
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

      {steps.length === 0 && (
        <Card className="p-10 text-center">
          <Rocket className="w-10 h-10 text-brand-300 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold">No action items for this role</p>
          <p className="text-sm text-slate-400 mt-1">You may already be strong in this area — check your Readiness Score!</p>
        </Card>
      )}
    </div>
  )
}
