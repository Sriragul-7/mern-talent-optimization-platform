import { useState, useEffect } from 'react'
import { Bookmark, Trash2, Github, Linkedin, GraduationCap, StickyNote, X, Check, Users } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { cgpaColor } from '../../utils/helpers'

// Pure localStorage shortlist — no backend needed.
// Stored per employer: sb-shortlist-{userId}
export function getShortlistKey(userId) { return `sb-shortlist-${userId}` }

export function useShortlist(userId) {
  const key = getShortlistKey(userId)

  const getAll = () => {
    try { return JSON.parse(localStorage.getItem(key) || '{}') }
    catch { return {} }
  }
  const save = (student) => {
    const all = getAll()
    if (!all[student._id]) {
      all[student._id] = { student, note: '', savedAt: new Date().toISOString() }
      localStorage.setItem(key, JSON.stringify(all))
    }
  }
  const remove = (id) => {
    const all = getAll()
    delete all[id]
    localStorage.setItem(key, JSON.stringify(all))
  }
  const has = (id) => !!getAll()[id]
  const setNote = (id, note) => {
    const all = getAll()
    if (all[id]) { all[id].note = note; localStorage.setItem(key, JSON.stringify(all)) }
  }
  const count = () => Object.keys(getAll()).length

  return { getAll, save, remove, has, setNote, count }
}

const SCORE_COLOR = s =>
  s >= 85 ? '#10b981' : s >= 70 ? '#0ea5e9' : s >= 55 ? '#3b82f6' : s >= 40 ? '#f59e0b' : '#ef4444'

const GRADE_STYLES = {
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  brand:   'text-brand-600 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800',
  blue:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  amber:   'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  red:     'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
}

function NoteModal({ entry, onClose, onSave }) {
  const [note, setNote] = useState(entry.note || '')
  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Note — {entry.student.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          placeholder="e.g. Strong React skills, follow up after May, good for frontend role…"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(note); onClose() }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors">
            <Check className="w-4 h-4" /> Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Shortlist() {
  const { user } = useAuth()
  const shortlist = useShortlist(user?._id || 'default')
  const [entries, setEntries] = useState([])
  const [noteTarget, setNoteTarget] = useState(null)

  const reload = () => {
    const all = shortlist.getAll()
    setEntries(Object.values(all).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
  }

  useEffect(() => { reload() }, [])

  const handleRemove = id => { shortlist.remove(id); reload() }
  const handleNote   = (id, note) => { shortlist.setNote(id, note); reload() }

  return (
    <div className="space-y-5">
      {noteTarget && (
        <NoteModal
          entry={noteTarget}
          onClose={() => setNoteTarget(null)}
          onSave={note => handleNote(noteTarget.student._id, note)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-brand-500" /> Saved Profiles
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {entries.length} candidate{entries.length !== 1 ? 's' : ''} saved · stored in your browser
          </p>
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-200">No candidates saved yet</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Click the <Bookmark className="inline w-3.5 h-3.5 mx-0.5" /> bookmark on any candidate card in Search Talent to save them here.
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(({ student: s, note, savedAt }) => (
          <Card key={s._id} className="p-5 flex flex-col">
            <div className="flex items-start gap-3 mb-4">
              <Avatar name={s.name} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{s.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{s.university || 'University not set'}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Saved {new Date(savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Score */}
            {s.readinessScore !== undefined && (
              <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Score</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${GRADE_STYLES[s.readinessGrade?.color] || GRADE_STYLES.amber}`}>
                    {s.readinessGrade?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.readinessScore}%`, background: SCORE_COLOR(s.readinessScore) }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: SCORE_COLOR(s.readinessScore) }}>{s.readinessScore}</span>
                </div>
              </div>
            )}

            {/* CGPA + skills */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">CGPA</span>
              <span className={`text-sm font-bold ${cgpaColor(s.cgpa)}`}>{s.cgpa ? s.cgpa.toFixed(1) : '—'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(s.skills || []).slice(0, 3).map(sk => <Badge key={sk} variant="blue">{sk}</Badge>)}
              {(s.skills || []).length > 3 && <Badge variant="slate">+{s.skills.length - 3}</Badge>}
            </div>

            {/* Note pill */}
            {note && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed line-clamp-2">{note}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <div className="flex gap-3">
                {s.github   && <a href={s.github}   target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"><Github   className="w-4 h-4" /></a>}
                {s.linkedin && <a href={s.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-500 transition-colors"><Linkedin className="w-4 h-4" /></a>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setNoteTarget({ student: s, note })}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                  <StickyNote className="w-3.5 h-3.5" />
                  {note ? 'Edit note' : 'Add note'}
                </button>
                <button onClick={() => handleRemove(s._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}