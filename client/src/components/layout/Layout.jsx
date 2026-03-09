import Sidebar from './Sidebar'
export default function Layout({ children, role = "student" }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar role={role} />
      <div className="flex-1 overflow-y-auto">
        <div className="page-fade">{children}</div>
      </div>
    </div>
  )
}