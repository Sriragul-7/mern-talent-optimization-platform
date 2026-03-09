import { cn } from '../../utils/helpers'

export default function ProgressBar({ value = 0, max = 100, label, showValue = true, color = 'brand', size = 'md', className = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colors = {
    brand: 'from-brand-400 to-brand-600',
    purple: 'from-accent-400 to-accent-600',
    green: 'from-emerald-400 to-emerald-600',
    amber: 'from-amber-400 to-amber-600',
  }
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
