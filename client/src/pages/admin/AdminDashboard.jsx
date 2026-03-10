import { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Clock, Building2 } from 'lucide-react'
import api from '../../services/api'

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  }
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Overview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Live stats across all students and employer accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard icon={Users}     label="Total Students"      value={stats?.totalStudents}     color="blue"   />
        <StatCard icon={Building2} label="Total Employers"     value={stats?.totalEmployers}    color="violet" />
        <StatCard icon={Clock}     label="Pending Approval"    value={stats?.pendingEmployers}  color="amber"  />
        <StatCard icon={UserCheck} label="Approved Employers"  value={stats?.approvedEmployers} color="emerald"/>
        <StatCard icon={UserX}     label="Rejected Employers"  value={stats?.rejectedEmployers} color="red"    />
      </div>

      {stats?.pendingEmployers > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-center gap-4">
          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              {stats.pendingEmployers} employer{stats.pendingEmployers > 1 ? 's' : ''} waiting for review
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
              Go to <strong>Employer Approvals</strong> to review their proof documents and approve or reject.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
