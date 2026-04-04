import { useState, useEffect, useRef } from 'react'
import {
  Rocket, BookOpen, FolderKanban, Award, User,
  ExternalLink, ChevronDown, Zap, TrendingUp, Star, CheckCircle2
} from 'lucide-react'
import { studentService } from '../../services/api'

const ROLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Data Scientist', 'ML Engineer', 'Data Engineer',
  'DevOps Engineer', 'Mobile Developer', 'Android Developer',
  'iOS Developer', 'UI/UX Designer', 'Cybersecurity Analyst',
]

const CAT_META = {
  skill:   { icon: BookOpen, gradient: 'from-sky-400 to-sky-600', ring: 'ring-sky-200 dark:ring-sky-800' },
  project: { icon: FolderKanban, gradient: 'from-violet-400 to-violet-600', ring: 'ring-violet-200 dark:ring-violet-800' },
  cert:    { icon: Award, gradient: 'from-amber-400 to-amber-600', ring: 'ring-amber-200 dark:ring-amber-800' },
  profile: { icon: User, gradient: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-200 dark:ring-emerald-800' },
}

const TYPE_BADGE = {
  'missing-core':   { text: 'Required', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  'missing-strong': { text: 'Important', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  upgrade:          { text: 'Level Up', cls: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  project:          { text: 'Portfolio', cls: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  cert:             { text: 'Credential', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  profile:          { text: 'Quick Win', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

const TAG_COLORS = {
  Free: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Paid: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  Docs: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Guide: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
  Ideas: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Internal: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
}

const PHASES = [
  {
    type: 'missing-core',
    title: 'Must-Learn Skills',
    desc: 'Core requirements. Missing these can disqualify you from many job listings.',
    icon: Zap,
    accent: 'border-l-red-400',
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-500',
  },
  {
    type: 'upgrade',
    title: 'Deepen What You Know',
    desc: 'You already have these. Strengthening them helps you stand out in interviews.',
    icon: TrendingUp,
    accent: 'border-l-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-900/30',
    iconColor: 'text-sky-500',
  },
  {
    type: 'missing-strong',
    title: 'Pick Up Next',
    desc: 'Not blocking, but expected by experienced interviewers.',
    icon: Star,
    accent: 'border-l-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-500',
  },
  {
    type: 'project',
    title: 'Build Your Portfolio',
    desc: "A real project beats a certification on any recruiter's checklist.",
    icon: FolderKanban,
    accent: 'border-l-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-900/30',
    iconColor: 'text-violet-500',
  },
  {
    type: 'cert',
    title: 'Earn a Certification',
    desc: 'Adds credibility especially for campus placements and first jobs.',
    icon: Award,
    accent: 'border-l-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-500',
  },
  {
    type: 'profile',
    title: 'Quick Profile Wins',
    desc: 'Takes 5 minutes and makes your profile visible in employer searches.',
    icon: User,
    accent: 'border-l-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500',
  },
]

const GRADE_STYLES = {
  emerald: { text: 'text-emerald-500', label: 'Job-Ready' },
  brand: { text: 'text-brand-500', label: 'Strong' },
  blue: { text: 'text-blue-500', label: 'Progressing' },
  amber: { text: 'text-amber-500', label: 'Building' },
  red: { text: 'text-red-500', label: 'Starting' },
}

const SCORE_COLOR = (score) =>
  score >= 80 ? '#10b981' : score >= 65 ? '#0ea5e9' : score >= 50 ? '#3b82f6' : score >= 35 ? '#f59e0b' : '#ef4444'

function ScoreRing({ value, size = 80 }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const color = SCORE_COLOR(value)

  return (
    <svg width={size} height={size} className="-rotate-90" style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="7" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - value / 100)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s ease' }}
      />
    </svg>
  )
}

function ResourceLink({ res }) {
  return (
    <a
      href={res.url}
      target={res.url.startsWith('/') ? '_self' : '_blank'}
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition-all hover:border-brand-300 hover:shadow-sm dark:border-slate-700/70 dark:bg-slate-800/40 dark:hover:border-brand-600/60"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-brand-500" />
        <span className="truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
          {res.label}
        </span>
      </div>
      {res.tag && (
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${TAG_COLORS[res.tag] || TAG_COLORS.Free}`}>
          {res.tag}
        </span>
      )}
    </a>
  )
}

function StepCard({ step, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = CAT_META[step.category] || CAT_META.skill
  const Icon = meta.icon
  const badge = TYPE_BADGE[step.type]

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow dark:border-slate-800 dark:bg-slate-900 ${open ? 'shadow-sm' : ''}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
      >
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} ring-2 ${meta.ring}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold leading-tight text-slate-800 dark:text-white">{step.title}</span>
            {badge && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.text}</span>}
          </div>
          {!open && <p className="mt-0.5 truncate text-xs text-slate-400">{step.why}</p>}
        </div>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-1 dark:border-slate-800">
          <p className="mb-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.why}</p>
          {step.courses?.length > 0 ? (
            <div className="space-y-2">
              {step.courses.map((res, idx) => <ResourceLink key={idx} res={res} />)}
            </div>
          ) : (
            <p className="text-xs italic text-slate-400">No resources available for this step.</p>
          )}
        </div>
      )}
    </div>
  )
}

function PhaseBlock({ phase, steps, phaseIndex }) {
  if (!steps.length) return null
  const PhaseIcon = phase.icon

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`mb-4 flex items-center gap-3 border-l-4 ${phase.accent} py-0.5 pl-4`}>
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${phase.iconBg}`}>
          <PhaseIcon className={`h-4 w-4 ${phase.iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">{phase.title}</p>
          <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">{phase.desc}</p>
        </div>
        <span className="ml-auto flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400 dark:bg-slate-800">
          {steps.length}
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <StepCard key={step.id} step={step} defaultOpen={phaseIndex === 0 && idx === 0} />
        ))}
      </div>
    </section>
  )
}

export default function ActionPlan() {
  const [role, setRole] = useState(ROLES[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = async (nextRole, initial = false) => {
    if (!initial) setBusy(true)
    setError('')
    try {
      const res = await studentService.getActionPlan(nextRole)
      if (mountedRef.current) setData(res.data)
    } catch {
      if (mountedRef.current) setError('Could not load action plan. Please try again.')
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setBusy(false)
      }
    }
  }

  useEffect(() => { load(role, true) }, []) // eslint-disable-line

  const changeRole = (nextRole) => {
    if (nextRole === role || busy) return
    setRole(nextRole)
    load(nextRole)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button onClick={() => load(role, true)} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
          Retry
        </button>
      </div>
    )
  }

  const steps = data?.steps || []
  const score = data?.currentScore ?? 0
  const gradeKey = data?.grade?.color || 'amber'
  const gradeStyle = GRADE_STYLES[gradeKey] || GRADE_STYLES.amber
  const grouped = {}
  PHASES.forEach((phase) => { grouped[phase.type] = steps.filter((step) => step.type === phase.type) })
  const totalSteps = steps.length
  const ringSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 68 : 76

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', transform: 'translate(30%,-30%)' }}
        />
        <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="relative flex-shrink-0 self-center sm:self-auto">
            <ScoreRing value={score} size={ringSize} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold leading-none text-white">{score}</span>
              <span className="text-[9px] text-white/60">/100</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/60">Your roadmap for</p>
            <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{role}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
              <span className={`text-sm font-bold ${gradeStyle.text}`}>{gradeStyle.label}</span>
              <span className="text-xs text-white/30">|</span>
              <span className="text-xs text-white/50">{totalSteps} action{totalSteps !== 1 ? 's' : ''} to complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Rocket className="h-3.5 w-3.5" /> Switch Target Role
        </p>
        <div className="sm:hidden">
          <select
            value={role}
            onChange={(e) => changeRole(e.target.value)}
            disabled={busy}
            className="input-field"
          >
            {ROLES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="hidden flex-wrap gap-2 sm:flex">
          {ROLES.map((item) => (
            <button
              key={item}
              onClick={() => changeRole(item)}
              disabled={busy}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                role === item
                  ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                  : 'border-slate-200 bg-transparent text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-600 dark:hover:text-brand-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className={`transition-opacity duration-200 ${busy ? 'pointer-events-none opacity-40' : ''}`}>
        {busy && (
          <div className="flex h-20 items-center justify-center">
            <svg className="h-6 w-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}

        {!busy && totalSteps > 0 && (
          <div className="space-y-5">
            {PHASES.map((phase, idx) => (
              grouped[phase.type]?.length > 0 ? <PhaseBlock key={phase.type} phase={phase} steps={grouped[phase.type]} phaseIndex={idx} /> : null
            ))}
          </div>
        )}

        {!busy && totalSteps === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">You're well-prepared!</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              No major gaps for this role. Check your Readiness Score for the full breakdown.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
