import React, { useState } from 'react'
import { AppProvider } from './contexts/AppContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Deployments from './components/Deployments'
import Settings from './components/Settings'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

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

  return (
    <AppProvider>
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
    </AppProvider>
  )
}

export default App