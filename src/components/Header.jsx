import React from 'react'
import { Search, Bell, User, Settings } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

const Header = () => {
  const { user } = useApp()

  return (
    <header className="bg-dark-900 border-b border-dark-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">DeployGenie</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-dark-200 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>
          
          <button className="relative p-2 text-dark-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
          
          <div className="flex items-center space-x-3 pl-3 border-l border-dark-600">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.email}</p>
              <p className="text-xs text-dark-400">{user.subscriptionTier} Plan</p>
            </div>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header