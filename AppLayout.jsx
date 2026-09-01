import { Navigate, Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import { useAuth } from './AuthContext'

export default function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-shell">
        <div className="center-loader">Cargando…</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Outlet />
      <BottomNav />
    </div>
  )
}
