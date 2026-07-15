import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { SubscriptionGuard } from '@/components/SubscriptionGuard'
import Landing from '@/pages/Landing'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Diary from '@/pages/Diary'
import NewEntry from '@/pages/NewEntry'
import EditEntry from '@/pages/EditEntry'
import Cases from '@/pages/Cases'
import NewCase from '@/pages/NewCase'
import CaseDetail from '@/pages/CaseDetail'
import Clients from '@/pages/Clients'
import NewClient from '@/pages/NewClient'
import ClientDetail from '@/pages/ClientDetail'
import Courts from '@/pages/Courts'
import Tools from '@/pages/Tools'
import Settings from '@/pages/Settings'
import Pricing from '@/pages/Pricing'
import Subscribe from '@/pages/Subscribe'
import PaymentStatus from '@/pages/PaymentStatus'
import Legal from '@/pages/Legal'
import LegalDrafter from '@/pages/LegalDrafter'
import FAQ from '@/pages/FAQ'
import Guides from '@/pages/Guides'
import GuideDetail from '@/pages/GuideDetail'
import TimeTracking from '@/pages/TimeTracking'
import Tasks from '@/pages/Tasks'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions'
import AdminPlans from '@/pages/admin/AdminPlans'
import AdminFirms from '@/pages/admin/AdminFirms'
import AdminPaymentMethods from '@/pages/admin/AdminPaymentMethods'
import AdminPaymentRequests from '@/pages/admin/AdminPaymentRequests'
import AdminBackup from '@/pages/admin/AdminBackup'
import { Loader2 } from 'lucide-react'

export default function App() {
  const { isAuthenticated, initialize, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initApp()
  }, [])

  async function initApp() {
    setLoading(true)
    await initialize()
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const PublicRoute = ({ children }: { children: React.ReactNode }) =>
    !isAuthenticated ? <>{children}</> : <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) =>
    isAuthenticated ? <>{children}</> : <Navigate to="/" replace />

  return (
    <BrowserRouter>
      <Routes>
        {/* Root — landing if not authenticated, redirect otherwise */}
        <Route path="/" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Landing />} />

        {/* Auth pages */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Public utility pages */}
        <Route path="/legal" element={<Legal />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:slug" element={<GuideDetail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/legal-drafter" element={<ProtectedRoute><LegalDrafter /></ProtectedRoute>} />
        <Route path="/limitation-calculator" element={<Navigate to="/tools" replace />} />
        <Route path="/subscribe/:planId" element={<Subscribe />} />
        <Route path="/payment-status" element={<PaymentStatus />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="firms" element={<AdminFirms />} />
          <Route path="payment-methods" element={<AdminPaymentMethods />} />
          <Route path="payment-requests" element={<AdminPaymentRequests />} />
          <Route path="backup" element={<AdminBackup />} />
        </Route>

        {/* App Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<SubscriptionGuard><Dashboard /></SubscriptionGuard>} />
          <Route path="/diary" element={<SubscriptionGuard><Diary /></SubscriptionGuard>} />
          <Route path="/diary/new" element={<SubscriptionGuard><NewEntry /></SubscriptionGuard>} />
          <Route path="/diary/:id/edit" element={<SubscriptionGuard><EditEntry /></SubscriptionGuard>} />
          <Route path="/cases" element={<SubscriptionGuard><Cases /></SubscriptionGuard>} />
          <Route path="/cases/new" element={<SubscriptionGuard><NewCase /></SubscriptionGuard>} />
          <Route path="/cases/:id" element={<SubscriptionGuard><CaseDetail /></SubscriptionGuard>} />
          <Route path="/clients" element={<SubscriptionGuard><Clients /></SubscriptionGuard>} />
          <Route path="/clients/new" element={<SubscriptionGuard><NewClient /></SubscriptionGuard>} />
          <Route path="/clients/:id" element={<SubscriptionGuard><ClientDetail /></SubscriptionGuard>} />
          <Route path="/courts" element={<SubscriptionGuard><Courts /></SubscriptionGuard>} />
          <Route path="/time" element={<SubscriptionGuard><TimeTracking /></SubscriptionGuard>} />
          <Route path="/tasks" element={<SubscriptionGuard><Tasks /></SubscriptionGuard>} />
          <Route path="/settings" element={<SubscriptionGuard><Settings /></SubscriptionGuard>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
