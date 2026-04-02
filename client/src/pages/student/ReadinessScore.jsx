import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Star, ChevronDown, ChevronUp, AlertCircle, BookOpen } from 'lucide-react'
import { studentService } from '../../services/api'

const ROLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Data Scientist', 'ML Engineer', 'Data Engineer',
  'DevOps Engineer', 'Mobile Developer', 'Android Developer',
  'iOS Developer', 'UI/UX Designer', 'Cybersecurity Analyst',
]

const GRADE_COLOR = { emerald: '#10b981', brand: '#0ea5e9', blue: '#3b82f6', amber: '#f59e0b', red: '#ef4444' }
const SCORE_COLOR = s => s >= 85 ? '#10b981' : s >= 70 ? '#0ea5e9' : s >= 55 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'

const GRADE_CLASS = {
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  brand:   'text-sky-600 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
  blue:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  amber:   'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  red:     'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
}
const GAP_BADGE_CLASS = {
  High: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  Low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
}
const LEARN_LINKS = {
  'React.js': 'https://react.dev',
  'Node.js': 'https://nodejs.org/docs',
  'TypeScript': 'https://www.typescriptlang.org/docs/handbook/',
  'Python': 'https://docs.python.org/3/tutorial/',
  'Docker': 'https://docs.docker.com/get-started/',
  'Kubernetes': 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
  'Flutter': 'https://docs.flutter.dev/',
  'Kotlin': 'https://kotlinlang.org/docs/',
  'Swift': 'https://swift.org/documentation/',
  'Figma': 'https://www.figma.com/resources/learn-design/',
  'AWS': 'https://skillbuilder.aws/',
  'TensorFlow': 'https://www.tensorflow.org/tutorials',
  'PyTorch': 'https://pytorch.org/tutorials/',
}

function Ring({ score, size = 140 }) {
  const r = size / 2 - 12
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={SCORE_COLOR(score)} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s ease' }} />
    </svg>
  )
}

function Bar({ label, score, max, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-700 dark:text-slate-200 font-bold">{score} <span className="text-slate-400 font-normal">/ {max}</span></span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${Math.round((score/max)*100)}%`, background: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

export default function ReadinessScore() {
  const [role, setRole]       = useState(ROLES[0])
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')
  const [showAll, setShowAll] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = async (r, initial = false) => {
    if (!initial) setBusy(true)
    setError('')
    try {
      const res = await studentService.getReadiness(r)
      if (mountedRef.current) setData(res.data)
    } catch {
      if (mountedRef.current) setError('Could not load readiness data.')
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

  const bd = data?.breakdown || {}
  const gradeClass = GRADE_CLASS[data?.grade?.color] || GRADE_CLASS.amber
  const matchedSkills = data?.matchedSkills || []
  const missingSkills = data?.missingSkills || []
  const highPriorityGaps = missingSkills.filter(skill => skill.importance === 'High')
  const supportingGaps = missingSkills.filter(skill => skill.importance !== 'High')

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

      {/* Score + Breakdown */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 transition-opacity duration-200 ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Ring */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <Ring score={data?.total ?? 0} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{data?.total ?? 0}</span>
              <span className="text-xs text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${gradeClass}`}>
            {data?.grade?.label ?? '—'}
          </span>
          <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{role}</p>
          <p className="text-xs text-slate-400 mt-0.5">Readiness Score</p>
        </div>

        {/* Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">Score Breakdown</p>
          <div className="space-y-4">
            <Bar label="Skill Match"      score={bd.skillScore   ?? 0} max={40} color="#0ea5e9" />
            <Bar label="Projects"         score={bd.projectScore ?? 0} max={20} color="#8b5cf6" />
            <Bar label="Certifications"   score={bd.certScore    ?? 0} max={15} color="#10b981" />
            <Bar label="Profile Complete" score={bd.profileScore ?? 0} max={15} color="#f59e0b" />
            <Bar label="CGPA"             score={bd.cgpaScore    ?? 0} max={10} color="#ec4899" />
          </div>
          <p className="mt-5 text-[11px] text-slate-400 text-right">
            Skills 40 · Projects 20 · Certs 15 · Profile 15 · CGPA 10
          </p>
        </div>
      </div>

      {/* Matched / Missing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Skills ({matchedSkills.length})
          </p>
          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map(s => (
                <span key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> {s.name}
                  <span className="opacity-60">· {s.level}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No matched skills for this role yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> Missing Skills ({missingSkills.length})
          </p>
          {missingSkills.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {missingSkills.map(g => (
                <div key={g.skill} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${g.importance === 'High' ? 'bg-red-400' : g.importance === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{g.skill}</span>
                    {g.tier === 'core' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Core</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-brand-500">+{g.impact}pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-500 font-medium">🎉 You have all required skills for this role!</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" /> Priority Skill Gaps
          </p>
          {highPriorityGaps.length > 0 ? (
            <div className="space-y-3">
              {highPriorityGaps.map(gap => (
                <GapRow key={gap.skill} gap={gap} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No high-priority gaps for this role. You can focus on supporting skills or move to the action plan.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" /> Supporting Skills To Add
          </p>
          {supportingGaps.length > 0 ? (
            <div className="space-y-3">
              {supportingGaps.slice(0, 6).map(gap => (
                <GapRow key={gap.skill} gap={gap} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You have already covered the supporting skills tracked for this role.
            </p>
          )}
        </div>
      </div>

      {/* Role rankings */}
      {(data?.allRoles || []).length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Role Fit Rankings
            </p>
            <button onClick={() => setShowAll(s => !s)} className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600">
              {showAll ? 'Show less' : 'Show all'}
              {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="space-y-2">
            {(showAll ? data.allRoles : data.allRoles.slice(0, 5)).map((r, i) => (
              <div key={r.role}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                  r.role === role
                    ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => changeRole(r.role)}>
                <span className="text-xs font-bold text-slate-400 w-5 flex-shrink-0">#{i+1}</span>
                <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{r.role}</span>
                <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.total}%`, background: SCORE_COLOR(r.total) }} />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white w-8 text-right">{r.total}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_CLASS[r.grade?.color] || GRADE_CLASS.amber}`}>
                  {r.grade?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GapRow({ gap }) {
  const learnUrl = LEARN_LINKS[gap.skill] || 'https://roadmap.sh'

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800 dark:text-white">{gap.skill}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${GAP_BADGE_CLASS[gap.importance] || GAP_BADGE_CLASS.Low}`}>
            {gap.importance}
          </span>
          {gap.tier === 'core' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-900/40">
              Core
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">Estimated impact: +{gap.impact} points</p>
      </div>
      <a
        href={learnUrl}
        target="_blank"
        rel="noreferrer"
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        Learn
      </a>
    </div>
  )
}
