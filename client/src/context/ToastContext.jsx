import { createContext, useContext, useState, useCallback } from 'react'
const ToastContext = createContext()
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✓  ' : '✕  '}{toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)