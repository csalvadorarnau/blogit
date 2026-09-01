import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { ToastProvider } from './ToastContext'
import AppLayout from './AppLayout'
import LoginScreen from './LoginScreen'
import FeedScreen from './FeedScreen'
import FollowingScreen from './FollowingScreen'
import WriteScreen from './WriteScreen'
import ProfileScreen from './ProfileScreen'
import PostDetailScreen from './PostDetailScreen'

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="app-shell">
        <div className="center-loader">Cargando…</div>
      </div>
    )
  }
  if (user) return <Navigate to="/" replace />
  return (
    <div className="app-shell">
      <LoginScreen />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<FeedScreen />} />
              <Route path="/siguiendo" element={<FollowingScreen />} />
              <Route path="/escribir" element={<WriteScreen />} />
              <Route path="/perfil" element={<ProfileScreen />} />
              <Route path="/post/:id" element={<PostDetailScreen />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
