import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Plus, Search, Filter, MoreVertical, Rocket, GitBranch, Clock, CheckCircle, XCircle } from 'lucide-react'
import NewProjectModal from './modals/NewProjectModal'

const Projects = () => {
  const { projects, deployProject } = useApp()
  const [showNewProject, setShowNewProject] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'building':
        return <Clock className="w-4 h-4 text-orange-400 animate-spin" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-dark-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'building':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-dark-500/10 text-dark-400 border-dark-500/20'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || project.status === filter
    return matchesSearch && matchesFilter
  })

  const handleDeploy = (projectId) => {
    deployProject(projectId)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-dark-400 mt-1">Manage and deploy your applications</p>
        </div>
        
        <button 
          onClick={() => setShowNewProject(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-dark-200 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Projects</option>
          <option value="deployed">Deployed</option>
          <option value="building">Building</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <div key={project.projectId} className="card p-6 card-hover animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">{project.projectName}</h3>
              </div>
              <button className="text-dark-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-dark-400 text-sm mb-4 truncate">{project.repoUrl}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(project.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <span className="text-xs text-dark-500">
                {project.deployConfig.framework}
              </span>
            </div>
            
            {project.lastDeployment && (
              <p className="text-xs text-dark-500 mb-4">
                Last deployed: {new Date(project.lastDeployment).toLocaleDateString()}
              </p>
            )}
            
            <div className="flex space-x-2">
              <button 
                onClick={() => handleDeploy(project.projectId)}
                disabled={project.status === 'building'}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="w-4 h-4" />
                <span>{project.status === 'building' ? 'Building...' : 'Deploy'}</span>
              </button>
              <button className="btn-secondary px-3">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-dark-400 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first project.'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <button 
              onClick={() => setShowNewProject(true)}
              className="btn-primary"
            >
              Create Your First Project
            </button>
          )}
        </div>
      )}

      {showNewProject && (
        <NewProjectModal onClose={() => setShowNewProject(false)} />
      )}
    </div>
  )
}

export default Projects