import { cn } from '../../utils/helpers'

const variants = {
  blue: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
  purple: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
}

export default function Badge({ children, variant = 'blue', className = '' }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}
