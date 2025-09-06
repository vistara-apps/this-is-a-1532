import React, { useState } from 'react'
import { Plus, GitBranch, Settings } from 'lucide-react'
import NewProjectModal from '../modals/NewProjectModal'

const QuickActions = () => {
  const [showNewProject, setShowNewProject] = useState(false)

  return (
    <>
      <div className="flex space-x-3">
        <button 
          onClick={() => setShowNewProject(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <GitBranch className="w-4 h-4" />
          <span>Connect Repo</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Configure</span>
        </button>
      </div>
      
      {showNewProject && (
        <NewProjectModal onClose={() => setShowNewProject(false)} />
      )}
    </>
  )
}

export default QuickActions