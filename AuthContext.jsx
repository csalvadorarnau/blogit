import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [profileName, setProfileName] = useState('')

  const loadProfileName = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle()
    setProfileName(data?.name || '')
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) loadProfileName(data.session.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) loadProfileName(newSession.user.id)
      else setProfileName('')
    })
    return () => listener.subscription.unsubscribe()
  }, [loadProfileName])

  async function signUp({ email, password, name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    // Aseguramos que exista el perfil aunque el trigger de la base de datos no se dispare
    // (por ejemplo si la confirmación de email está activada y aún no hay sesión).
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email, name }, { onConflict: 'id' })
    }
    return data
  }

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user || null,
    profileName,
    setProfileName,
    loading: session === undefined,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
