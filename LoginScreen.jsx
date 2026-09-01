import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmNotice, setConfirmNotice] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) return
    setLoading(true)
    try {
      if (isSignup) {
        const { session } = await signUp({ email: email.trim(), password, name: name.trim() })
        if (!session) {
          setConfirmNotice(true)
        }
      } else {
        await signIn({ email: email.trim(), password })
      }
    } catch (err) {
      setError(mapError(err))
    } finally {
      setLoading(false)
    }
  }

  if (confirmNotice) {
    return (
      <div className="screen auth-screen">
        <div className="auth-wordmark">
          blog<span>it</span>
        </div>
        <p className="auth-tagline">
          Te hemos enviado un email de confirmación a <b>{email}</b>. Abre el enlace para activar tu cuenta y
          vuelve aquí para iniciar sesión.
        </p>
        <button className="primary-btn" type="button" onClick={() => { setConfirmNotice(false); setMode('login') }}>
          Volver a iniciar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="screen auth-screen">
      <div className="auth-wordmark">
        blog<span>it</span>
      </div>
      <p className="auth-tagline">
        {isSignup
          ? 'Crea tu cuenta para empezar a escribir y descubrir historias.'
          : 'Bienvenida de nuevo. Inicia sesión para continuar.'}
      </p>
      <form onSubmit={handleSubmit}>
        {isSignup && (
          <>
            <label className="field-label" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              className="field-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </>
        )}
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="field-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tú@email.com"
          autoComplete="email"
        />
        <label className="field-label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          className="field-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />
        {error && <p className="form-error">{error}</p>}
        <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Un momento…' : isSignup ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </form>
      <p className="auth-switch">
        {isSignup ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
        <button type="button" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError('') }}>
          {isSignup ? 'Inicia sesión' : 'Crea una'}
        </button>
      </p>
    </div>
  )
}

function mapError(err) {
  const msg = err?.message || ''
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email.'
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.'
  return msg || 'Ha ocurrido un error. Inténtalo de nuevo.'
}
