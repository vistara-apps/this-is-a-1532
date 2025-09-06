import React from 'react'
import { FolderGit2, Rocket, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderGit2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+2 this week'
    },
    {
      title: 'Active Deployments',
      value: stats.activeDeployments,
      icon: Rocket,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: 'In progress'
    },
    {
      title: 'Successful Deploys',
      value: stats.successfulDeployments,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '98% success rate'
    },
    {
      title: 'Failed Deploys',
      value: stats.failedDeployments,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      change: '-50% vs last week'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        
        return (
          <div key={index} className="card p-6 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{card.value}</h3>
              <p className="text-dark-400 text-sm mb-2">{card.title}</p>
              <p className="text-xs text-green-400">{card.change}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards