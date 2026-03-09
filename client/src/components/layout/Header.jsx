export default function Header({ title, action, subtitle }) {
  return (
    <div className="px-8 py-5 flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', minHeight: '72px' }}>
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}