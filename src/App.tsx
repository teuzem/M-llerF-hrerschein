import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useDashboardData } from './hooks/useDashboardData'
import { useTranslation } from 'react-i18next'

// Layouts
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import DashboardLayout from './components/layout/DashboardLayout'
import MobileBottomNav from './components/layout/MobileBottomNav'

// Pages
import Home from './pages/Home'
import Services from './pages/Services'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Pricing from './pages/Pricing'
import Testimonials from './pages/Testimonials'
import NewApplication from './pages/NewApplication'
import ApplicationForm from './pages/ApplicationForm'
import SubmissionConfirmation from './pages/SubmissionConfirmation'
import ApplicationStatus from './pages/ApplicationStatus'
import Legal from './pages/Legal'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Clients from './pages/Clients'
import PublicProfile from './pages/PublicProfile'
import Gallery from './pages/Gallery'
import FAQ from './pages/FAQ'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'

// Uber Eats Pages
import UberEats from './pages/UberEats'
import UberEatsCreateAccount from './pages/UberEatsCreateAccount'
import UberEatsActivation from './pages/UberEatsActivation'
import UberEatsUnlock from './pages/UberEatsUnlock'

// Dashboard Pages
import DashboardHome from './pages/dashboard/Home'
import DashboardApplications from './pages/dashboard/Applications'
import DashboardDocuments from './pages/dashboard/Documents'
import DashboardProfile from './pages/dashboard/Profile'
import DashboardHelp from './pages/dashboard/Help'
import ArticlePage from './pages/dashboard/ArticlePage'
import DashboardTestimonials from './pages/dashboard/Testimonials'
import DashboardMedia from './pages/dashboard/Media'
import DashboardMessages from './pages/dashboard/Messages'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'
import Breadcrumbs from './components/ui/Breadcrumbs'
import WhatsAppButton from './components/ui/WhatsAppButton'

import { VisitorTracker } from './components/VisitorTracker'

import './lib/i18n'

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg"/></div>}>
      <AuthProvider>
        <VisitorTracker />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/*" element={<MainLayout />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Application Flow */}
            <Route path="/application/status/:id" element={<ApplicationStatus />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard/*" element={<DashboardWrapper />} />
              <Route path="/application/form" element={<ApplicationForm />} />
              <Route path="/application/confirmation/:id" element={<SubmissionConfirmation />} />
            </Route>

            {/* Error Routes */}
            <Route path="/500" element={<ServerError />} />
            <Route path="/404" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#363636', color: '#fff' },
              success: { style: { background: '#10B981' } },
              error: { style: { background: '#EF4444' } },
            }}
          />
        </Router>
      </AuthProvider>
    </Suspense>
  )
}

// Layout for public pages
const MainLayout = () => {
  const { i18n } = useTranslation()
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  
  // Redirect root to German version if not German
  React.useEffect(() => {
    if (location.pathname === '/') {
      // Ensure German is default language
      if (i18n.language !== 'de') {
        i18n.changeLanguage('de');
      }
    }
  }, [location.pathname, i18n]);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-16 md:pb-0">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        {!isAuthPage && location.pathname !== '/' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
            <Breadcrumbs />
          </div>
        )}
        <Routes>
          {/* German routes as default */}
          <Route path="/" element={<Home />} />
          <Route path="/de" element={<Navigate to="/" replace />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<PublicProfile />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/application/new" element={<NewApplication />} />
          
          {/* Uber Eats Routes */}
          <Route path="/ubereats" element={<UberEats />} />
          <Route path="/ubereats/create-account" element={<UberEatsCreateAccount />} />
          <Route path="/ubereats/activation" element={<UberEatsActivation />} />
          <Route path="/ubereats/unlock" element={<UberEatsUnlock />} />
          
          {/* Language-specific routes (redirect to German by default) */}
          <Route path="/en/*" element={<Navigate to="/" replace />} />
          <Route path="/fr/*" element={<Navigate to="/" replace />} />
          <Route path="/de/*" element={<Navigate to="/" replace />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      <MobileBottomNav />
    </div>
  );
};

// Wrapper for dashboard pages to fetch data once
const DashboardWrapper = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Erreur de chargement</h3>
          <p>Nous n'avons pas pu charger les données de votre tableau de bord.</p>
          <p className="text-sm mt-2">{error || 'Aucune donnée disponible.'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome data={data} />} />
        <Route path="/applications" element={<DashboardApplications data={data} />} />
        <Route path="/documents" element={<DashboardDocuments data={data} />} />
        <Route path="/profile" element={<DashboardProfile />} />
        <Route path="/testimonials" element={<DashboardTestimonials />} />
        <Route path="/media" element={<DashboardMedia />} />
        <Route path="/messages" element={<DashboardMessages />} />
        <Route path="/help" element={<DashboardHelp />} />
        <Route path="/help/:slug" element={<ArticlePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};


export default App
