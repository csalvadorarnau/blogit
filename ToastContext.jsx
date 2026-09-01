import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)
  const timerRef = useRef(null)

  const showToast = useCallback((text) => {
    setMessage(text)
    setShow(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShow(false), 1800)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={'toast' + (show ? ' show' : '')}>{message}</div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
