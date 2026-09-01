import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import AppLayout from './components/AppLayout'
import LoginScreen from './screens/LoginScreen'
import FeedScreen from './screens/FeedScreen'
import FollowingScreen from './screens/FollowingScreen'
import WriteScreen from './screens/WriteScreen'
import ProfileScreen from './screens/ProfileScreen'
import PostDetailScreen from './screens/PostDetailScreen'

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
