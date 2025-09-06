import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { User, CreditCard, Key, Bell, GitBranch, Shield, Save } from 'lucide-react'

const Settings = () => {
  const { user } = useApp()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    notifications: {
      deploymentSuccess: true,
      deploymentFailure: true,
      weeklyReports: false,
      marketingEmails: false
    },
    integrations: {
      github: true,
      gitlab: false,
      bitbucket: false,
      slack: false,
      discord: false
    }
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: GitBranch },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Profile Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Plan</label>
                <input
                  type="text"
                  value={user.subscriptionTier}
                  disabled
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <button className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Notification Preferences</h3>
            
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-dark-400 text-sm">
                      {key === 'deploymentSuccess' && 'Get notified when deployments complete successfully'}
                      {key === 'deploymentFailure' && 'Get notified when deployments fail'}
                      {key === 'weeklyReports' && 'Receive weekly deployment summary reports'}
                      {key === 'marketingEmails' && 'Receive product updates and marketing emails'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'integrations':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Integrations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.integrations).map(([key, value]) => (
                <div key={key} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium capitalize">{key}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      value ? 'bg-green-500/20 text-green-400' : 'bg-dark-500/20 text-dark-400'
                    }`}>
                      {value ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <button
                    onClick={() => updateSetting('integrations', key, !value)}
                    className={value ? 'btn-secondary' : 'btn-primary'}
                  >
                    {value ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
        
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
            <p className="text-dark-400">This section is under development.</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 mt-1">Manage your account preferences and integrations</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="lg:col-span-3">
          <div className="card p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings