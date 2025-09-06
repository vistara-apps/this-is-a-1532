import React from 'react'
import { useApp } from '../contexts/AppContext'
import StatsCards from './dashboard/StatsCards'
import RecentActivity from './dashboard/RecentActivity'
import DeploymentChart from './dashboard/DeploymentChart'
import QuickActions from './dashboard/QuickActions'

const Dashboard = () => {
  const { projects, deployments, stats } = useApp()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Welcome back! Here's what's happening with your deployments.</p>
        </div>
        <QuickActions />
      </div>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeploymentChart deployments={deployments} />
        <RecentActivity projects={projects} deployments={deployments} />
      </div>
    </div>
  )
}

export default Dashboard