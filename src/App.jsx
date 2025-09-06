import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Deployments from './components/Deployments'
import Settings from './components/Settings'
import Login from './components/auth/Login'
import ErrorBoundary from './components/ErrorBoundary'
import { useAuth } from './contexts/AuthContext'
import errorHandler from './utils/errorHandler'
import billingService from './services/billingService'

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard')
  const { isAuthenticated, loading } = useAuth()

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <Projects />
      case 'deployments':
        return <Deployments />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading DeployGenie...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        // Initialize Stripe for billing
        await billingService.initializeStripe()
        
        // Set up error handler notifications
        errorHandler.addNotificationCallback((error, errorEntry) => {
          // You can integrate with toast notifications here
          console.error('Application error:', error)
        })
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()

    // Cleanup on unmount
    return () => {
      errorHandler.clearErrorLog()
    }
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
          
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f9fafb',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f9fafb',
                },
              },
            }}
          />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
