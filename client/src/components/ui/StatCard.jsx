import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, gradient }) {
  const isUp = trend === 'up'
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${gradient || 'bg-brand-100 dark:bg-brand-900/30'}`}>
          {Icon && <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
        </div>
        {trendValue !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
