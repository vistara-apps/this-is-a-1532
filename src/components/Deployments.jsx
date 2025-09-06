import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Search, Filter, RotateCcw, ExternalLink, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react'

const Deployments = () => {
  const { deployments, projects, rollbackDeployment } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedLogs, setExpandedLogs] = useState({})

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'building':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default:
        return 'bg-dark-500/10 text-dark-400 border-dark-500/20'
    }
  }

  const filteredDeployments = deployments
    .filter(deployment => {
      const project = projects.find(p => p.projectId === deployment.projectId)
      const matchesSearch = project?.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           deployment.commitHash.includes(searchTerm)
      const matchesStatus = statusFilter === 'all' || deployment.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const toggleLogs = (deploymentId) => {
    setExpandedLogs(prev => ({
      ...prev,
      [deploymentId]: !prev[deploymentId]
    }))
  }

  const handleRollback = (projectId) => {
    rollbackDeployment(projectId)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Deployments</h1>
          <p className="text-dark-400 mt-1">Monitor and manage your deployment history</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-dark-200 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="success">Successful</option>
          <option value="building">Building</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredDeployments.map((deployment, index) => {
          const project = projects.find(p => p.projectId === deployment.projectId)
          if (!project) return null
          
          const isExpanded = expandedLogs[deployment.deploymentId]
          
          return (
            <div key={deployment.deploymentId} className="card p-6 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(deployment.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{project.projectName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}>
                        {deployment.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-dark-400">
                      <span className="font-mono">#{deployment.commitHash}</span>
                      <span>{new Date(deployment.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {deployment.status === 'success' && (
                    <button 
                      onClick={() => handleRollback(deployment.projectId)}
                      className="btn-secondary flex items-center space-x-2 text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Rollback</span>
                    </button>
                  )}
                  
                  <button className="text-dark-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => toggleLogs(deployment.deploymentId)}
                    className="text-dark-400 hover:text-white"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <h4 className="text-sm font-medium text-white mb-2">Deployment Logs</h4>
                  <div className="bg-dark-900 rounded-lg p-4 font-mono text-sm">
                    <pre className="text-dark-300 whitespace-pre-wrap">{deployment.logs}</pre>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredDeployments.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No deployments found</h3>
          <p className="text-dark-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Deploy your first project to see deployment history here.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default Deployments