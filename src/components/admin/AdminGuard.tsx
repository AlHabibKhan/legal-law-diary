import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
