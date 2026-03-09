import { cn } from '../../utils/helpers'

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-glow',
  secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200',
  ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  outline: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
}
const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', loading, disabled, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
