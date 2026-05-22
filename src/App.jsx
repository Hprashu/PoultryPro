import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Lazy loaded page modules
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'))
const SignupPage = React.lazy(() => import('./pages/SignupPage.jsx'))
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'))
const FlockManager = React.lazy(() => import('./pages/FlockManager.jsx'))
const AIHealthIntelligence = React.lazy(() => import('./pages/AIHealthIntelligence.jsx'))
const SmartEnvironment = React.lazy(() => import('./pages/SmartEnvironment.jsx'))
const SmartScheduling = React.lazy(() => import('./pages/SmartScheduling.jsx'))
const BusinessAnalytics = React.lazy(() => import('./pages/BusinessAnalytics.jsx'))
const SmartAutomation = React.lazy(() => import('./pages/SmartAutomation.jsx'))
const FarmMarketplace = React.lazy(() => import('./pages/FarmMarketplace.jsx'))
const AIDiseaseScanner = React.lazy(() => import('./pages/AIDiseaseScanner.jsx'))
const Settings = React.lazy(() => import('./pages/Settings.jsx'))
const FeedInventory = React.lazy(() => import('./pages/FeedInventory.jsx'))
const ImageGallery = React.lazy(() => import('./pages/ImageGallery.jsx'))
const AboutFounder = React.lazy(() => import('./pages/AboutFounder.jsx'))

// Sleek agritech loader fallback
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(135deg,#f8fafc,#ffffff,#ecfdf5)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.20),transparent_34%),linear-gradient(135deg,#020617,#052e16_48%,#0f172a)] transition-colors duration-300">
      <div className="relative flex flex-col items-center gap-4">
        {/* Futuristic breathing orb indicator */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full bg-emerald-500/10 animate-ping" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-heading text-lg font-black tracking-wider uppercase text-emerald-800 dark:text-emerald-400">PoultryPro OS</h2>
          <p className="text-xs font-semibold text-surface-550 dark:text-slate-400 animate-pulse">Syncing realtime farm state...</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Auth routes */}
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* Operational OS routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/about-founder" element={<ProtectedRoute><AboutFounder /></ProtectedRoute>} />
                  <Route path="/poultry-manager" element={<ProtectedRoute><FlockManager /></ProtectedRoute>} />
                  <Route path="/health-intel" element={<ProtectedRoute><AIHealthIntelligence /></ProtectedRoute>} />
                  <Route path="/smart-environment" element={<ProtectedRoute><SmartEnvironment /></ProtectedRoute>} />
                  <Route path="/smart-scheduling" element={<ProtectedRoute><SmartScheduling /></ProtectedRoute>} />
                  <Route path="/business-analytics" element={<ProtectedRoute><BusinessAnalytics /></ProtectedRoute>} />
                  <Route path="/smart-automation" element={<ProtectedRoute><SmartAutomation /></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><FarmMarketplace /></ProtectedRoute>} />
                  <Route path="/disease-scanner" element={<ProtectedRoute><AIDiseaseScanner /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  
                  {/* Standalone feed log (retains route functionality) */}
                  <Route path="/feed" element={<ProtectedRoute><FeedInventory /></ProtectedRoute>} />
                  <Route path="/images" element={<ProtectedRoute><ImageGallery /></ProtectedRoute>} />

                  {/* Legacy Redirects for backward compatibility */}
                  <Route path="/about" element={<Navigate to="/about-founder" replace />} />
                  <Route path="/founder" element={<Navigate to="/about-founder" replace />} />
                  <Route path="/flocks" element={<Navigate to="/poultry-manager" replace />} />
                  <Route path="/analytics" element={<Navigate to="/health-intel" replace />} />
                  <Route path="/health" element={<Navigate to="/smart-environment" replace />} />
                  <Route path="/vaccination" element={<Navigate to="/smart-scheduling" replace />} />
                  <Route path="/reports" element={<Navigate to="/business-analytics" replace />} />
                  <Route path="/financials" element={<Navigate to="/business-analytics" replace />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}


