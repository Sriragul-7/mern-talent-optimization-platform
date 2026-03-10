import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, XCircle, BookOpen } from 'lucide-react'
import { studentService } from '../../services/api'

const ROLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Data Scientist', 'ML Engineer', 'Data Engineer',
  'DevOps Engineer', 'Mobile Developer', 'Android Developer',
  'iOS Developer', 'UI/UX Designer', 'Cybersecurity Analyst',
]

const IMP_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' }
const IMP_CLASS = {
  High:   'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  Low:    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
}

function Ring({ value, size = 96 }) {
  const r = size / 2 - 9
  const circ = 2 * Math.PI * r
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#0ea5e9' : value >= 30 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="9" className="dark:stroke-slate-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

// compute match percent from gaps data (core+strong matched / core+strong total)
function computeMatchPct(data) {
  if (!data) return 0
  // backend returns readiness.total as match, but that's 0-100 score
  // we want skill match % = matched core+strong / total core+strong
  const matched  = (data.strengths || []).length
  const missing  = (data.gaps || []).filter(g => g.importance !== 'Low').length
  const total    = matched + missing
  if (!total) return 0
  return Math.round((matched / total) * 100)
}

export default function SkillGap() {
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
      const res = await studentService.getSkillGap(r)
      if (mountedRef.current) setData(res.data)
    } catch {
      if (mountedRef.current) setError('Could not load skill gap data.')
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

  const strengths = data?.strengths || []
  const gaps      = data?.gaps || []
  const matchPct  = computeMatchPct(data)
  const coreGaps  = gaps.filter(g => g.importance === 'High')
  const otherGaps = gaps.filter(g => g.importance !== 'High')

  return (
    <div className="space-y-5">
      {/* Role selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Select Target Role</p>
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

      {/* Match score + strengths */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-5 transition-opacity duration-200 ${busy ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Match ring */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center justify-center text-center">
          <div className="relative mb-3">
            <Ring value={matchPct} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{matchPct}%</span>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{role}</p>
          <p className="text-xs text-slate-400 mt-0.5">Skill match (core + strong)</p>
        </div>

        {/* Strengths */}
        <div className="sm:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Your Matching Skills ({strengths.length})
          </p>
          {strengths.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {strengths.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> {s}
                  </span>
                ))}
              </div>
              {matchPct < 100 && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  You match {matchPct}% of core + strong skills. Fill the gaps below to increase your readiness score.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400">
              No matching skills for <strong>{role}</strong> yet. Add relevant skills from <a href="/student/skills" className="text-brand-500 hover:underline">My Skills</a>.
            </p>
          )}
        </div>
      </div>

      {/* Gaps */}
      {gaps.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Skills to Develop ({gaps.length})
          </p>

          {/* Core / High priority first */}
          {coreGaps.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-2">● Core Required</p>
              <div className="space-y-2">
                {coreGaps.map(g => <GapRow key={g.skill} g={g} />)}
              </div>
            </div>
          )}

          {otherGaps.length > 0 && (
            <div>
              {coreGaps.length > 0 && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">● Strong / Bonus</p>}
              <div className="space-y-2">
                {otherGaps.map(g => <GapRow key={g.skill} g={g} />)}
              </div>
            </div>
          )}
        </div>
      ) : data ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">All skills matched!</h3>
          <p className="text-sm text-slate-500">You have all required skills for <strong>{role}</strong>.</p>
        </div>
      ) : null}
    </div>
  )
}

function GapRow({ g }) {
  const LEARN_LINKS = {
    'React.js':     'https://react.dev',
    'Node.js':      'https://nodejs.org/docs',
    'TypeScript':   'https://www.typescriptlang.org/docs/handbook/',
    'Python':       'https://docs.python.org/3/tutorial/',
    'Docker':       'https://docs.docker.com/get-started/',
    'Kubernetes':   'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    'Flutter':      'https://docs.flutter.dev/',
    'Kotlin':       'https://kotlinlang.org/docs/',
    'Swift':        'https://swift.org/documentation/',
    'Figma':        'https://www.figma.com/resources/learn-design/',
    'AWS':          'https://skillbuilder.aws/',
    'TensorFlow':   'https://www.tensorflow.org/tutorials',
    'PyTorch':      'https://pytorch.org/tutorials/',
  }
  const learnUrl = LEARN_LINKS[g.skill] || 'https://roadmap.sh'

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-800 dark:text-white">{g.skill}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            g.importance === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200' :
            g.importance === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200'
          }`}>
            {g.importance} Priority
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">+{g.impact} pts to readiness score when added</p>
      </div>
      <a href={learnUrl} target="_blank" rel="noreferrer"
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
        <BookOpen className="w-3 h-3" /> Learn
      </a>
    </div>
  )
}
