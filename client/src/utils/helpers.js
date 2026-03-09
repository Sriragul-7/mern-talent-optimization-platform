export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const clampText = (text = '', maxLen = 100) =>
  text.length > maxLen ? text.slice(0, maxLen) + '...' : text

export const levelColor = (level) => {
  const map = {
    Beginner: 'badge-amber',
    Intermediate: 'badge-blue',
    Advanced: 'badge-purple',
    Expert: 'badge-green',
  }
  return map[level] || 'badge-blue'
}

export const cgpaColor = (cgpa) => {
  if (cgpa >= 8.5) return 'text-emerald-500'
  if (cgpa >= 7.0) return 'text-brand-500'
  if (cgpa >= 5.5) return 'text-amber-500'
  return 'text-red-500'
}

export const SKILL_COLORS = [
  '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316',
]
