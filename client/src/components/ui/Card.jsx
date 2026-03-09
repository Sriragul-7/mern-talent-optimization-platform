import { cn } from '../../utils/helpers'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div className={cn('card', hover && 'card-hover', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={cn('px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800', className)}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
