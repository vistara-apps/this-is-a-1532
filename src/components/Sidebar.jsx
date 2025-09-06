import React from 'react'
import { 
  LayoutDashboard, 
  FolderGit2, 
  Rocket, 
  Settings, 
  CreditCard,
  BarChart3,
  GitBranch
} from 'lucide-react'

const Sidebar = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-700 z-30">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">DeployGenie</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
        
        <div className="mt-8 p-4 bg-dark-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-white">Pro Plan</span>
          </div>
          <p className="text-xs text-dark-400 mb-3">
            Unlimited deployments, advanced features
          </p>
          <button className="w-full btn-accent text-sm py-2">
            Upgrade Plan
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar