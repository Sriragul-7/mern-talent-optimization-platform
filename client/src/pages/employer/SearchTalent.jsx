import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, Github, Linkedin, GraduationCap, SlidersHorizontal,
  X, TrendingUp, ArrowUpDown, FileText, Download, Mail,
  Award, FolderKanban, Layers, Bookmark, BookmarkCheck
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { employerService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { cgpaColor, formatDate } from '../../utils/helpers'
import { useShortlist } from './Shortlist'

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

const SCORE_COLOR = s =>
  s >= 85 ? '#10b981' : s >= 70 ? '#0ea5e9' : s >= 55 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'

// ── Score bar ─────────────────────────────────────────────────────────────────
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

// ── Resume section heading ────────────────────────────────────────────────────
function SectionTitle({ text }) {
  return (
    <div style={{ marginBottom: '2px' }}>
      <p style={{
        fontSize: '12pt', fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: '0.5px', color: '#1e293b', margin: '0 0 4px 0',
        borderBottom: '2px solid #2563eb', paddingBottom: '3px', display: 'inline-block',
      }}>{text}</p>
    </div>
  )
}

// ── Resume content (shared between modal view + PDF) ─────────────────────────
function ResumeContent({ data }) {
  const { student = {}, skills = [], projects = [], certifications = [] } = data

  const skillGroups = skills.reduce((acc, sk) => {
    const cat = sk.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(sk.name)
    return acc
  }, {})

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: '10.5pt',
      lineHeight: '1.5',
      color: '#2c3e50',
      padding: '15mm 20mm',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{
          fontSize: '24pt', fontWeight: '600', margin: '0 0 4px 0',
          letterSpacing: '0.5px', color: '#1e293b', lineHeight: '1.2', textTransform: 'uppercase',
        }}>{student.name || '—'}</h1>
        <p style={{ fontSize: '11pt', fontWeight: '400', color: '#2563eb', margin: '0 0 8px 0' }}>
          {student.department || 'Student'}
        </p>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '20px',
          fontSize: '9.5pt', color: '#4b5563',
          borderBottom: '1px solid #e5e7eb', paddingBottom: '10px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={11} /> {student.email || '—'}
          </span>
          {student.linkedin && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Linkedin size={11} /> {student.linkedin.replace('https://www.linkedin.com/in/', '')}
            </span>
          )}
          {student.github && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Github size={11} /> {student.github.replace('https://github.com/', '')}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Education */}
        <div>
          <SectionTitle text="EDUCATION" />
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
              <p style={{ fontWeight: '600', fontSize: '11pt', margin: 0, color: '#1e293b' }}>
                {student.university || '—'}
              </p>
              <p style={{ fontSize: '10pt', color: '#5f6b7a', margin: 0, fontWeight: '500' }}>
                {student.cgpa ? `CGPA: ${student.cgpa}` : ''}
              </p>
            </div>
            <p style={{ fontSize: '10.5pt', color: '#4a5a6e', margin: '2px 0' }}>
              BE – {student.department || '—'}
            </p>
          </div>
        </div>

        {/* Skills */}
        {Object.keys(skillGroups).length > 0 && (
          <div>
            <SectionTitle text="TECHNICAL SKILLS" />
            <div style={{ marginTop: '8px' }}>
              {Object.entries(skillGroups).map(([cat, list]) => (
                <div key={cat} style={{ marginBottom: '8px', display: 'flex', gap: '12px' }}>
                  <p style={{ fontWeight: '600', fontSize: '10.5pt', color: '#1e293b', margin: 0, minWidth: '150px' }}>
                    {cat}:
                  </p>
                  <p style={{ fontSize: '10.5pt', color: '#4a5a6e', margin: 0, flex: 1 }}>
                    {list.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <SectionTitle text="PROJECTS" />
            <div style={{ marginTop: '8px' }}>
              {projects.map((p, i) => (
                <div key={p._id || i} style={{ marginBottom: i === projects.length - 1 ? 0 : '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <p style={{ fontWeight: '600', fontSize: '11.5pt', margin: 0, color: '#1e293b' }}>{p.title}</p>
                    <span style={{ fontSize: '9pt', fontWeight: '500', color: p.status === 'Completed' ? '#059669' : '#b45309' }}>
                      {p.status}
                    </span>
                  </div>
                  {p.description && (
                    <p style={{ fontSize: '10pt', color: '#4a5a6e', margin: '0 0 4px 0', lineHeight: '1.5' }}>
                      {p.description}
                    </p>
                  )}
                  {p.tech?.length > 0 && (
                    <p style={{ fontSize: '9.5pt', color: '#5f6b7a', margin: '0 0 2px 0' }}>
                      <span style={{ fontWeight: '600', color: '#3a4a5c' }}>Tech:</span> {p.tech.join(' · ')}
                    </p>
                  )}
                  {p.github && (
                    <p style={{ fontSize: '9pt', color: '#2563eb', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                      {p.github.replace('https://', '')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <SectionTitle text="CERTIFICATIONS" />
            <div style={{ marginTop: '8px' }}>
              {certifications.map((c, i) => (
                <div key={c._id || i} style={{ marginBottom: i === certifications.length - 1 ? 0 : '10px', display: 'flex', gap: '12px' }}>
                  <p style={{ fontWeight: '600', fontSize: '10.5pt', color: '#1e293b', margin: 0, minWidth: '120px' }}>{c.name}:</p>
                  <span style={{ fontSize: '10.5pt', color: '#4a5a6e' }}>
                    {c.issuer}{c.credentialId ? ` · ${c.credentialId}` : ''}
                    {c.date && <span style={{ fontSize: '9.5pt', color: '#6b7a8c', marginLeft: '8px' }}>{formatDate(c.date)}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Resume modal ──────────────────────────────────────────────────────────────
function ResumeModal({ studentId, studentName, role, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [downloading, setDownloading] = useState(false)
  const resumeRef = useRef()

  useEffect(() => {
    employerService.getStudentProfile(studentId, role)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load resume.'))
      .finally(() => setLoading(false))
  }, [studentId, role])

  const downloadPDF = async () => {
    if (!resumeRef.current) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const name = (data?.student?.name || studentName || 'Resume').replace(/\s+/g, '_')
      await html2pdf()
        .set({
          margin: [0, 0, 0, 0],
          filename: `${name}_Resume.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(resumeRef.current)
        .save()
    } finally { setDownloading(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{studentName}'s Resume</p>
              <p className="text-xs text-slate-400">Viewed as employer · Read only</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <button
                onClick={downloadPDF}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading ? 'Downloading…' : 'Download PDF'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-48 text-red-500 text-sm font-medium">{error}</div>
          )}
          {data && (
            <div ref={resumeRef} className="bg-white">
              <ResumeContent data={data} />
            </div>
          )}
        </div>

        {/* Stats bar at bottom */}
        {data && (
          <div className="flex items-center gap-6 px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex-shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              {data.skills?.length || 0} skills
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <FolderKanban className="w-3.5 h-3.5" />
              {data.projects?.length || 0} projects
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Award className="w-3.5 h-3.5" />
              {data.certifications?.length || 0} certifications
            </span>
            {data.student?.readinessScore !== undefined && (
              <span className="flex items-center gap-1.5 text-xs font-bold ml-auto"
                style={{ color: SCORE_COLOR(data.readiness?.total || 0) }}>
                Match score: {data.readiness?.total || 0}/100
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SearchTalent() {
  const [query, setQuery]   = useState('')
  const [role, setRole]     = useState(ROLE_LIST[0])
  const [filters, setFilters] = useState({ skill: '', university: '', minCgpa: '' })
  const [sortBy, setSortBy] = useState('match')
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  // Resume modal state
  const [resumeStudent, setResumeStudent] = useState(null) // { _id, name }

  // Shortlist (bookmark)
  const { user } = useAuth()
  const shortlist = useShortlist(user?._id || 'default')
  const [bookmarked, setBookmarked] = useState({})

  useEffect(() => {
    const all = shortlist.getAll()
    const map = {}
    Object.keys(all).forEach(id => { map[id] = true })
    setBookmarked(map)
  }, [])

  const toggleBookmark = (student) => {
    if (shortlist.has(student._id)) {
      shortlist.remove(student._id)
      setBookmarked(b => { const n = { ...b }; delete n[student._id]; return n })
    } else {
      shortlist.save(student)
      setBookmarked(b => ({ ...b, [student._id]: true }))
    }
  }

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

  useEffect(() => { fetchTalent('', filters, role, sortBy) }, []) // eslint-disable-line

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

      {/* Resume modal */}
      {resumeStudent && (
        <ResumeModal
          studentId={resumeStudent._id}
          studentName={resumeStudent.name}
          role={role}
          onClose={() => setResumeStudent(null)}
        />
      )}

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
              }`}>
              {r}
            </button>
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Searching...' : <><span className="font-bold text-slate-800 dark:text-white">{total}</span> candidate{total !== 1 ? 's' : ''} found</>}
        </p>
        <p className="text-xs text-slate-400">
          Sorted by <span className="font-semibold text-slate-600 dark:text-slate-300">
            {sortBy === 'match' ? `match score for ${role}` : 'CGPA'}
          </span>
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
            <Card key={student._id} hover className="p-5 relative flex flex-col">
              {/* Rank badge */}
              {idx < 3 && sortBy === 'match' && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md"
                  style={{ background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#cd7c2f' }}>
                  #{idx + 1}
                </div>
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

              {/* Match score */}
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

              {/* Footer row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <div className="flex gap-3 items-center">
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
                  {/* Bookmark */}
                  <button
                    onClick={() => toggleBookmark(student)}
                    title={bookmarked[student._id] ? 'Remove from shortlist' : 'Save to shortlist'}
                    className={`transition-colors ${bookmarked[student._id] ? 'text-brand-500' : 'text-slate-300 hover:text-brand-400'}`}
                  >
                    {bookmarked[student._id]
                      ? <BookmarkCheck className="w-4 h-4" />
                      : <Bookmark className="w-4 h-4" />
                    }
                  </button>
                </div>
                {/* View Resume button */}
                <button
                  onClick={() => setResumeStudent({ _id: student._id, name: student.name })}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Resume
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