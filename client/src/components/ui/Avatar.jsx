import { getInitials } from '../../utils/helpers'

const SIZE = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }
const COLORS = ['from-brand-400 to-brand-600', 'from-accent-400 to-accent-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600']

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const colorIdx = name.charCodeAt(0) % COLORS.length
  if (src) return <img src={src} alt={name} className={`${SIZE[size]} rounded-full object-cover ${className}`} />
  return (
    <div className={`${SIZE[size]} rounded-full bg-gradient-to-br ${COLORS[colorIdx]} flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  )
}
