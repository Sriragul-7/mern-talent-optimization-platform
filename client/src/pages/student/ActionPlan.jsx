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
  skill:   { icon: BookOpen,     gradient: 'from-sky-400 to-sky-600',       ring: 'ring-sky-200 dark:ring-sky-800'     },
  project: { icon: FolderKanban, gradient: 'from-violet-400 to-violet-600', ring: 'ring-violet-200 dark:ring-violet-800' },
  cert:    { icon: Award,        gradient: 'from-amber-400 to-amber-600',   ring: 'ring-amber-200 dark:ring-amber-800'   },
  profile: { icon: User,         gradient: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-200 dark:ring-emerald-800' },
}

const TYPE_BADGE = {
  'missing-core':   { text: 'Required',   cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'     },
  'missing-strong': { text: 'Important',  cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  'upgrade':        { text: 'Level Up',   cls: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'     },
  'project':        { text: 'Portfolio',  cls: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  'cert':           { text: 'Credential', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  'profile':        { text: 'Quick Win',  cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
}

const TAG_COLORS = {
  Free:     'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  Paid:     'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  Docs:     'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  Guide:    'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300',
  Ideas:    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  Internal: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300',
}

const PHASES = [
  {
    type:  'missing-core',
    title: 'Must-Learn Skills',
    desc:  'Core requirements — missing these will disqualify you from most job listings.',
    icon:  Zap,
    accent: 'border-l-red-400',
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-500',
  },
  {
    type:  'upgrade',
    title: 'Deepen What You Know',
    desc:  'You have these already — levelling up makes you stand out in interviews.',
    icon:  TrendingUp,
    accent: 'border-l-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-900/30',
    iconColor: 'text-sky-500',
  },
  {
    type:  'missing-strong',
    title: 'Pick Up Next',
    desc:  'Not blocking, but expected by experienced interviewers.',
    icon:  Star,
    accent: 'border-l-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-500',
  },
  {
    type:  'project',
    title: 'Build Your Portfolio',
    desc:  'A real project beats a certification on any recruiter\'s checklist.',
    icon:  FolderKanban,
    accent: 'border-l-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-900/30',
    iconColor: 'text-violet-500',
  },
  {
    type:  'cert',
    title: 'Earn a Certification',
    desc:  'Adds credibility especially for campus placements and first jobs.',
    icon:  Award,
    accent: 'border-l-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-500',
  },
  {
    type:  'profile',
    title: 'Quick Profile Wins',
    desc:  'Takes 5 minutes and makes your profile visible in employer searches.',
    icon:  User,
    accent: 'border-l-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500',
  },
]

const SCORE_COLOR = s =>
  s >= 80 ? '#10b981' : s >= 65 ? '#0ea5e9' : s >= 50 ? '#3b82f6' : s >= 35 ? '#f59e0b' : '#ef4444'

function ScoreRing({ value, size = 80 }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const color = SCORE_COLOR(value)
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="7" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s ease' }} />
    </svg>
  )
}

function ResourceLink({ res }) {
  return (
    <a
      href={res.url}
      target={res.url.startsWith('/') ? '_self' : '_blank'}
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800/40 hover:border-brand-300 dark:hover:border-brand-600/60 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
        <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate font-medium">
          {res.label}
        </span>
      </div>
      {res.tag && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${TAG_COLORS[res.tag] || TAG_COLORS.Free}`}>
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
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-shadow ${open ? 'shadow-sm' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center flex-shrink-0 ring-2 ${meta.ring}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{step.title}</span>
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                {badge.text}
              </span>
            )}
          </div>
          {!open && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{step.why}</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{step.why}</p>
          {step.courses?.length > 0 ? (
            <div className="space-y-2">
              {step.courses.map((res, i) => <ResourceLink key={i} res={res} />)}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No resources available for this step.</p>
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
    <div className="relative">
      {/* Phase header */}
      <div className={`flex items-center gap-3 mb-3 pl-4 border-l-4 ${phase.accent} py-0.5`}>
        <div className={`w-8 h-8 rounded-xl ${phase.iconBg} flex items-center justify-center flex-shrink-0`}>
          <PhaseIcon className={`w-4 h-4 ${phase.iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">{phase.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{phase.desc}</p>
        </div>
        <span className="ml-auto flex-shrink-0 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {steps.length}
        </span>
      </div>

      {/* Step cards */}
      <div className="space-y-2 pl-0">
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} defaultOpen={phaseIndex === 0 && i === 0} />
        ))}
      </div>
    </div>
  )
}

const GRADE_STYLES = {
  emerald: { bar: '#10b981', text: 'text-emerald-500', label: 'Job-Ready' },
  brand:   { bar: '#0ea5e9', text: 'text-brand-500',   label: 'Strong'    },
  blue:    { bar: '#3b82f6', text: 'text-blue-500',    label: 'Progressing' },
  amber:   { bar: '#f59e0b', text: 'text-amber-500',   label: 'Building'  },
  red:     { bar: '#ef4444', text: 'text-red-500',     label: 'Starting'  },
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
      if (mountedRef.current) setError('Could not load action plan. Please try again.')
    } finally {
      if (mountedRef.current) { setLoading(false); setBusy(false) }
    }
  }

  useEffect(() => { load(role, true) }, []) // eslint-disable-line

  const changeRole = r => { if (r === role || busy) return; setRole(r); load(r) }

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
      <p className="text-red-500 font-medium text-sm">{error}</p>
      <button onClick={() => load(role, true)} className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
        Retry
      </button>
    </div>
  )

  const steps = data?.steps || []
  const score = data?.currentScore ?? 0
  const gradeKey = data?.grade?.color || 'amber'
  const gradeStyle = GRADE_STYLES[gradeKey] || GRADE_STYLES.amber

  const grouped = {}
  PHASES.forEach(p => { grouped[p.type] = steps.filter(s => s.type === p.type) })
  const totalSteps = steps.length

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Score header ── */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="relative flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <ScoreRing value={score} size={76} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-white leading-none">{score}</span>
              <span className="text-[9px] text-white/60">/100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-0.5">Your roadmap for</p>
            <h2 className="text-xl font-bold text-white truncate">{role}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-sm font-bold ${gradeStyle.text}`}>{gradeStyle.label}</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/50 text-xs">{totalSteps} action{totalSteps !== 1 ? 's' : ''} to complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Role pills ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Rocket className="w-3.5 h-3.5" /> Switch Target Role
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => (
            <button key={r} onClick={() => changeRole(r)} disabled={busy}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${
                role === r
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 bg-transparent'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className={`transition-opacity duration-200 ${busy ? 'opacity-40 pointer-events-none' : ''}`}>

        {busy && (
          <div className="flex items-center justify-center h-20">
            <svg className="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}

        {!busy && totalSteps > 0 && (
          <div className="space-y-6">
            {PHASES.map((phase, i) =>
              grouped[phase.type]?.length > 0 ? (
                <PhaseBlock
                  key={phase.type}
                  phase={phase}
                  steps={grouped[phase.type]}
                  phaseIndex={i}
                />
              ) : null
            )}
          </div>
        )}

        {!busy && totalSteps === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-14 text-center">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-base">You're well-prepared!</p>
            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              No major gaps for this role. Check your Readiness Score for the full breakdown.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}