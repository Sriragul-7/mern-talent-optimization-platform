import { useState, useEffect, useCallback } from 'react'
import { Search, Github, Linkedin, GraduationCap, SlidersHorizontal, X, TrendingUp, ArrowUpDown } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { employerService } from '../../services/api'
import { cgpaColor } from '../../utils/helpers'

const ROLE_LIST = [
  'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
  'Mobile Developer', 'Backend Developer', 'Frontend Developer',
]

const GRADE_STYLES = {
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  brand:   'text-brand-600 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800',
  blue:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  amber:   'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  red:     'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
}

const SCORE_COLOR = (s) =>
  s >= 85 ? '#10b981' : s >= 70 ? '#0ea5e9' : s >= 55 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'

function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: SCORE_COLOR(score) }} />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color: SCORE_COLOR(score) }}>{score}</span>
    </div>
  )
}

export default function SearchTalent() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState(ROLE_LIST[0])
  const [filters, setFilters] = useState({ skill: '', university: '', minCgpa: '' })
  const [sortBy, setSortBy] = useState('match')
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchTalent = useCallback(async (q, f, r, s) => {
    setLoading(true)
    try {
      const res = await employerService.searchTalent({
        q: q || undefined,
        skill: f.skill || undefined,
        university: f.university || undefined,
        minCgpa: f.minCgpa || undefined,
        role: r,
        sortBy: s,
      })
      setResults(res.data.students)
      setTotal(res.data.total)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTalent('', filters, role, sortBy) }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchTalent(query, filters, role, sortBy), 400)
    return () => clearTimeout(t)
  }, [query, filters, role, sortBy, fetchTalent])

  const clearFilters = () => setFilters({ skill: '', university: '', minCgpa: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  const allSkills = [...new Set(results.flatMap(s => s.skills || []))]
  const allUnis   = [...new Set(results.map(s => s.university).filter(Boolean))]

  return (
    <div className="space-y-5">

      {/* Role selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Rank candidates for role:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_LIST.map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                role === r
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-300'
              }`}
            >{r}</button>
          ))}
        </div>
      </Card>

      {/* Search + sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input-field pl-10" placeholder="Search by name, skill, or university..."
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <button
          onClick={() => setSortBy(s => s === 'match' ? 'cgpa' : 'match')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-300 transition-all"
          title="Toggle sort"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortBy === 'match' ? 'By Match' : 'By CGPA'}
        </button>
        <Button variant={showFilters ? 'primary' : 'secondary'} onClick={() => setShowFilters(f => !f)}>
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Filter by Skill</label>
              <select className="input-field" value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}>
                <option value="">All Skills</option>
                {allSkills.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Filter by University</label>
              <select className="input-field" value={filters.university} onChange={e => setFilters(f => ({ ...f, university: e.target.value }))}>
                <option value="">All Universities</option>
                {allUnis.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min CGPA</label>
              <input type="number" step="0.1" min="0" max="10" className="input-field" placeholder="e.g. 8.0"
                value={filters.minCgpa} onChange={e => setFilters(f => ({ ...f, minCgpa: e.target.value }))} />
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </Card>
      )}

      {/* Results count + sort label */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Searching...' : <><span className="font-bold text-slate-800 dark:text-white">{total}</span> candidate{total !== 1 ? 's' : ''} found</>}
        </p>
        <p className="text-xs text-slate-400">
          Sorted by <span className="font-semibold text-slate-600 dark:text-slate-300">{sortBy === 'match' ? `match score for ${role}` : 'CGPA'}</span>
        </p>
      </div>

      {/* Talent cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((student, idx) => (
            <Card key={student._id} hover className="p-5 relative">
              {/* Rank badge for top 3 */}
              {idx < 3 && sortBy === 'match' && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md"
                  style={{ background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#cd7c2f' }}
                >#{idx + 1}</div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <Avatar name={student.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate">{student.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3 h-3" /> {student.university || 'University not set'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{student.department}</p>
                </div>
              </div>

              {/* Readiness score */}
              {student.readinessScore !== undefined && (
                <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Score</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${GRADE_STYLES[student.readinessGrade?.color] || GRADE_STYLES.amber}`}>
                      {student.readinessGrade?.label}
                    </span>
                  </div>
                  <ScoreBar score={student.readinessScore} />
                  <p className="text-[10px] text-slate-400 mt-1">{student.matchedSkillCount ?? 0} of required skills matched</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">CGPA</span>
                <span className={`text-sm font-bold ${cgpaColor(student.cgpa)}`}>
                  {student.cgpa ? student.cgpa.toFixed(1) : '—'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(student.skills || []).slice(0, 3).map(skill => (
                  <Badge key={skill} variant="blue">{skill}</Badge>
                ))}
                {(student.skills || []).length > 3 && (
                  <Badge variant="slate">+{student.skills.length - 3}</Badge>
                )}
                {(student.skills || []).length === 0 && (
                  <span className="text-xs text-slate-400">No skills listed</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-3">
                  {student.github && (
                    <a href={student.github} target="_blank" rel="noreferrer"
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {student.linkedin && (
                    <a href={student.linkedin} target="_blank" rel="noreferrer"
                      className="text-slate-400 hover:text-brand-500 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors">
                  View Profile →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No candidates match your search</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or role selection</p>
        </div>
      )}
    </div>
  )
}
