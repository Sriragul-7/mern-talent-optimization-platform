import { useState, useEffect } from 'react'
import { TrendingUp, ChevronDown, ChevronUp, CheckCircle2, XCircle, Star } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { studentService } from '../../services/api'

// Must match AVAILABLE_ROLES in server/utils/readiness.js
const ROLE_LIST = [
  'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
  'Mobile Developer', 'Backend Developer', 'Frontend Developer',
  'ML Engineer', 'Data Engineer', 'UI/UX Designer',
  'Android Developer', 'iOS Developer', 'Cybersecurity Analyst',
]

const GRADE_STYLES = {
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  brand:   'text-brand-600 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800',
  blue:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  amber:   'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  red:     'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
}

const SCORE_COLOR = (s) =>
  s >= 85 ? '#10b981' : s >= 70 ? '#0ea5e9' : s >= 55 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'

function ScoreRing({ score, size = 140 }) {
  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="10"
        className="text-slate-100 dark:text-slate-800" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={SCORE_COLOR(score)} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s ease' }} />
    </svg>
  )
}

function BreakdownBar({ label, score, max, color }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-slate-800 dark:text-white">{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ReadinessScore() {
  const [role, setRole] = useState(ROLE_LIST[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)   // initial load
  const [switching, setSwitching] = useState(false) // role change
  const [showAll, setShowAll] = useState(false)
  const [error, setError] = useState('')

  const fetchReadiness = async (selectedRole, initial = false) => {
    if (!initial) setSwitching(true)
    setError('')
    try {
      const res = await studentService.getReadiness(selectedRole)
      setData(res.data)
    } catch (err) {
      setError('Failed to load readiness data. Please try again.')
      console.error(err)
    } finally {
      if (initial) setLoading(false)
      else setSwitching(false)
    }
  }

  useEffect(() => {
    fetchReadiness(role, true)
  }, []) // eslint-disable-line

  const handleRoleChange = (r) => {
    if (r === role) return
    setRole(r)
    fetchReadiness(r)
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
      <button onClick={() => fetchReadiness(role, true)}
        className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600">
        Retry
      </button>
    </div>
  )

  const d = data || {}
  const breakdown = d.breakdown || {}
  const gradeStyle = GRADE_STYLES[d.grade?.color] || GRADE_STYLES.amber
  const allRoles = d.allRoles || []

  return (
    <div className="space-y-5">
      {/* Role selector */}
      <Card className="p-5">
        <h3 className="section-title mb-3">Select Target Role</h3>
        <div className="flex flex-wrap gap-2">
          {ROLE_LIST.map(r => (
            <button key={r} onClick={() => handleRoleChange(r)}
              disabled={switching}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-60 ${
                role === r
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </Card>

      {/* Main score + breakdown */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 transition-opacity duration-200 ${switching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {/* Score ring */}
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <ScoreRing score={d.total ?? 0} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{d.total ?? 0}</span>
              <span className="text-xs text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${gradeStyle}`}>
            {d.grade?.label || '—'}
          </span>
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{role}</p>
          <p className="text-xs text-slate-400 mt-0.5">Readiness Score</p>
        </Card>

        {/* Breakdown */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="section-title mb-5">Score Breakdown</h3>
          <div className="space-y-4">
            <BreakdownBar label="Skill Match"      score={breakdown.skillScore   ?? 0} max={40} color="#0ea5e9" />
            <BreakdownBar label="Projects"         score={breakdown.projectScore ?? 0} max={20} color="#8b5cf6" />
            <BreakdownBar label="Certifications"   score={breakdown.certScore    ?? 0} max={15} color="#10b981" />
            <BreakdownBar label="Profile Complete" score={breakdown.profileScore ?? 0} max={15} color="#f59e0b" />
            <BreakdownBar label="CGPA"             score={breakdown.cgpaScore    ?? 0} max={10} color="#ec4899" />
          </div>
          <p className="mt-4 text-[11px] text-slate-400 text-right">
            Skills 40 · Projects 20 · Certs 15 · Profile 15 · CGPA 10
          </p>
        </Card>
      </div>

      {/* Matched / Missing skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Skills
          </h3>
          {(d.matchedSkills || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {d.matchedSkills.map(s => (
                <span key={s.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> {s.name}
                  <span className="opacity-60">· {s.level}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No matched skills for this role yet. Add relevant skills from My Skills.</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> Missing Skills
          </h3>
          {(d.missingSkills || []).length > 0 ? (
            <div className="space-y-2">
              {d.missingSkills.map(g => (
                <div key={g.skill} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{g.skill}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={g.importance === 'High' ? 'red' : g.importance === 'Medium' ? 'amber' : 'blue'}>
                      {g.importance}
                    </Badge>
                    <span className="text-xs text-brand-500 font-semibold">+{g.impact}pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-500 font-medium">🎉 You have all required skills for this role!</p>
          )}
        </Card>
      </div>

      {/* All-role rankings */}
      {allRoles.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Your Role Fit Rankings
            </h3>
            <button onClick={() => setShowAll(s => !s)}
              className="flex items-center gap-1 text-xs text-brand-500 font-semibold hover:text-brand-600">
              {showAll ? 'Show less' : 'Show all'}
              {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="space-y-2">
            {(showAll ? allRoles : allRoles.slice(0, 4)).map((r, i) => (
              <div key={r.role}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  r.role === role
                    ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                    : 'bg-slate-50 dark:bg-slate-800/50'
                }`}>
                <span className="text-sm font-bold text-slate-400 w-5">#{i + 1}</span>
                <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{r.role}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${r.total}%`, background: SCORE_COLOR(r.total) }} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white w-8 text-right">{r.total}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${GRADE_STYLES[r.grade?.color] || GRADE_STYLES.amber}`}>
                    {r.grade?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
