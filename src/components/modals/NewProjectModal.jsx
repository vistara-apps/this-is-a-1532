import React, { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { X, GitBranch, Globe, Server } from 'lucide-react'

const NewProjectModal = ({ onClose }) => {
  const { createProject } = useApp()
  const [formData, setFormData] = useState({
    projectName: '',
    repoUrl: '',
    framework: 'React',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    environment: 'production'
  })

  const frameworks = [
    { value: 'React', label: 'React', buildCommand: 'npm run build' },
    { value: 'Next.js', label: 'Next.js', buildCommand: 'npm run build' },
    { value: 'Vue.js', label: 'Vue.js', buildCommand: 'npm run build' },
    { value: 'Angular', label: 'Angular', buildCommand: 'ng build' },
    { value: 'Node.js', label: 'Node.js', buildCommand: 'npm install' },
    { value: 'Express', label: 'Express', buildCommand: 'npm install' }
  ]

  const handleFrameworkChange = (framework) => {
    const selectedFramework = frameworks.find(f => f.value === framework)
    setFormData(prev => ({
      ...prev,
      framework,
      buildCommand: selectedFramework?.buildCommand || 'npm run build'
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const projectData = {
      projectName: formData.projectName,
      repoUrl: formData.repoUrl,
      deployConfig: {
        framework: formData.framework,
        buildCommand: formData.buildCommand,
        startCommand: formData.startCommand,
        environment: formData.environment
      }
    }
    
    createProject(projectData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-xl border border-dark-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="My Awesome App"
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Framework
              </label>
              <select
                value={formData.framework}
                onChange={(e) => handleFrameworkChange(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {frameworks.map(framework => (
                  <option key={framework.value} value={framework.value}>
                    {framework.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Repository URL *
            </label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="url"
                required
                value={formData.repoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
                placeholder="https://github.com/username/repository"
                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-dark-200 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Build Command
              </label>
              <input
                type="text"
                value={formData.buildCommand}
                onChange={(e) => setFormData(prev => ({ ...prev, buildCommand: e.target.value }))}
                placeholder="npm run build"
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Start Command
              </label>
              <input
                type="text"
                value={formData.startCommand}
                onChange={(e) => setFormData(prev => ({ ...prev, startCommand: e.target.value }))}
                placeholder="npm start"
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
          
          <div className="bg-dark-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">Preview Configuration</h3>
            <div className="text-xs text-dark-400 space-y-1">
              <p><span className="text-dark-300">Framework:</span> {formData.framework}</p>
              <p><span className="text-dark-300">Build:</span> {formData.buildCommand}</p>
              <p><span className="text-dark-300">Start:</span> {formData.startCommand}</p>
              <p><span className="text-dark-300">Environment:</span> {formData.environment}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewProjectModal