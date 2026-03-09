import { useState, useEffect } from 'react'
import { Save, Github, Linkedin, User } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import ProgressBar from '../../components/ui/ProgressBar'
import { studentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const FIELDS = [
  { key: 'name',       label: 'Full Name',       type: 'text',   placeholder: 'Arjun Sharma' },
  { key: 'age',        label: 'Age',             type: 'number', placeholder: '22' },
  { key: 'email',      label: 'Email Address',   type: 'email',  placeholder: 'arjun@college.edu', disabled: true },
  { key: 'cgpa',       label: 'CGPA',            type: 'number', placeholder: '8.7', step: '0.01', min: '0', max: '10' },
  { key: 'university', label: 'University',      type: 'text',   placeholder: 'NIT Trichy' },
  { key: 'department', label: 'Department',      type: 'text',   placeholder: 'Computer Science' },
  { key: 'github',     label: 'GitHub URL',      type: 'url',    placeholder: 'https://github.com/username' },
  { key: 'linkedin',   label: 'LinkedIn URL',    type: 'url',    placeholder: 'https://linkedin.com/in/username' },
]

function calcCompletion(profile) {
  const keys = ['name', 'age', 'email', 'cgpa', 'university', 'department', 'github', 'linkedin']
  const filled = keys.filter(k => profile[k] && String(profile[k]).trim()).length
  return Math.round((filled / keys.length) * 100)
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(user || {})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    studentService.getProfile()
      .then(res => {
        setProfile(res.data)
        updateUser(res.data)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await studentService.updateProfile(profile)
      setProfile(res.data)
      updateUser(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const completion = calcCompletion(profile)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile summary card */}
      <Card className="p-6">
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={profile.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {[profile.department, profile.university].filter(Boolean).join(' • ')}
            </p>
            <div className="mt-2 flex items-center gap-3">
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Profile Completion</span>
            <span className="text-sm font-bold text-brand-600">{completion}%</span>
          </div>
          <ProgressBar value={completion} showValue={false} />
          {completion < 100 && (
            <p className="text-xs text-slate-500 mt-2">Fill in all fields to maximize employer visibility</p>
          )}
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-brand-500" />
          <h3 className="section-title">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(({ key, label, type, disabled, ...rest }) => (
            <div key={key} className={key === 'github' || key === 'linkedin' ? 'sm:col-span-2' : ''}>
              <label className="label">{label}</label>
              <input
                type={type}
                className={`input-field ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={profile[key] || ''}
                disabled={disabled}
                onChange={e => !disabled && setProfile(p => ({ ...p, [key]: e.target.value }))}
                {...rest}
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/40">
            {error}
          </p>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} loading={saving} variant={saved ? 'secondary' : 'primary'}>
            <Save className="w-4 h-4" />
            {saved ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
