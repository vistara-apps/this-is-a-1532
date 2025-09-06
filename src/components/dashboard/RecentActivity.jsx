import React from 'react'
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'

const RecentActivity = ({ projects, deployments }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'building':
        return <Clock className="w-4 h-4 text-orange-400 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-dark-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Deployed successfully'
      case 'failed':
        return 'Deployment failed'
      case 'building':
        return 'Building...'
      default:
        return 'Unknown status'
    }
  }

  const recentDeployments = deployments
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {recentDeployments.map((deployment) => {
          const project = projects.find(p => p.projectId === deployment.projectId)
          if (!project) return null
          
          return (
            <div key={deployment.deploymentId} className="flex items-center space-x-4 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors">
              <div className="flex-shrink-0">
                {getStatusIcon(deployment.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {project.projectName}
                </p>
                <p className="text-xs text-dark-400">
                  {getStatusText(deployment.status)} • {new Date(deployment.timestamp).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-dark-500 font-mono">
                  {deployment.commitHash}
                </span>
                <button className="text-dark-400 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      {recentDeployments.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-dark-500 mx-auto mb-2" />
          <p className="text-dark-400">No recent deployments</p>
        </div>
      )}
    </div>
  )
}

export default RecentActivity