import { cn } from '../../utils/helpers'

export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          className={cn(
            'input-field',
            Icon && 'pl-10',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
