import { useState, useEffect } from 'react'
import { Target, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { studentService } from '../../services/api'

const IMPORTANCE_VARIANT = { High: 'red', Medium: 'amber', Low: 'blue' }

// Role list — matches backend AVAILABLE_ROLES
const ROLES = [
  'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
  'Mobile Developer', 'Backend Developer', 'Frontend Developer',
  'ML Engineer', 'Data Engineer', 'UI/UX Designer',
  'Android Developer', 'iOS Developer', 'Cybersecurity Analyst',
]

function ScoreRing({ value, size = 88 }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#0ea5e9' : value >= 30 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

export default function SkillGap() {
  const [role, setRole] = useState(ROLES[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  const fetchGap = async (selectedRole) => {
    try {
      const res = await studentService.getSkillGap(selectedRole)
      setData(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchGap(role).finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (r) => {
    if (r === role) return
    setRole(r)
    setSwitching(true)
    await fetchGap(r)
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

  const match = data?.match ?? 0
  const strengths = data?.strengths ?? []
  const gaps = data?.gaps ?? []

  return (
    <div className="space-y-5">
      {/* Role selector */}
      <Card className="p-5">
        <h3 className="section-title mb-3">Select Target Role</h3>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => (
            <button key={r} onClick={() => handleRoleChange(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                role === r
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </Card>

      {/* Score + strengths */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 transition-opacity duration-300 ${switching ? 'opacity-40' : 'opacity-100'}`}>
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <ScoreRing value={match} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{match}%</span>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-2">{role}</p>
          <p className="text-xs text-slate-400 mt-0.5">Skill match</p>
        </Card>

        <Card className="p-5 sm:col-span-2">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Your Matching Skills
          </h3>
          {strengths.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strengths.map(s => (
                <span key={s}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No matching skills yet for this role. Add relevant skills from My Skills page.</p>
          )}
          {match > 0 && (
            <div className="mt-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
              <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">
                You match {match}% of the required skills for {role}. Close the gaps below to increase your readiness.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Skill gaps */}
      {gaps.length > 0 ? (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="section-title">Skills to Develop ({gaps.length})</h3>
          </div>
          <div className="space-y-3">
            {gaps.map(g => (
              <div key={g.skill} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{g.skill}</span>
                    <Badge variant={IMPORTANCE_VARIANT[g.importance] || 'blue'}>
                      {g.importance} Priority
                    </Badge>
                    {g.tier === 'core' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                        Core Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    +{g.impact} pts to readiness score when added
                  </p>
                </div>
                <a
                  href={`https://roadmap.sh`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                >
                  Learn
                </a>
              </div>
            ))}
          </div>
        </Card>
      ) : data && gaps.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">All skills matched!</h3>
          <p className="text-sm text-slate-500">You have all required skills for {role}. Consider adding bonus skills to stand out further.</p>
        </Card>
      ) : null}
    </div>
  )
}
