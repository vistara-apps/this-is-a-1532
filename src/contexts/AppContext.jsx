import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: 'user-1',
    email: 'developer@example.com',
    subscriptionTier: 'Pro',
    createdAt: '2024-01-15'
  })

  const [projects, setProjects] = useState([
    {
      projectId: 'proj-1',
      userId: 'user-1',
      projectName: 'E-commerce App',
      repoUrl: 'https://github.com/user/ecommerce-app',
      deployConfig: { framework: 'React', buildCommand: 'npm run build' },
      createdAt: '2024-01-20',
      status: 'deployed',
      lastDeployment: '2024-01-25T10:30:00Z'
    },
    {
      projectId: 'proj-2',
      userId: 'user-1',
      projectName: 'Portfolio Website',
      repoUrl: 'https://github.com/user/portfolio',
      deployConfig: { framework: 'Next.js', buildCommand: 'npm run build' },
      createdAt: '2024-01-18',
      status: 'building',
      lastDeployment: '2024-01-25T11:15:00Z'
    },
    {
      projectId: 'proj-3',
      userId: 'user-1',
      projectName: 'API Service',
      repoUrl: 'https://github.com/user/api-service',
      deployConfig: { framework: 'Node.js', buildCommand: 'npm install' },
      createdAt: '2024-01-22',
      status: 'failed',
      lastDeployment: '2024-01-25T09:45:00Z'
    }
  ])

  const [deployments, setDeployments] = useState([
    {
      deploymentId: 'dep-1',
      projectId: 'proj-1',
      commitHash: 'abc123',
      status: 'success',
      timestamp: '2024-01-25T10:30:00Z',
      logs: 'Build completed successfully\nDeployment to production environment completed'
    },
    {
      deploymentId: 'dep-2',
      projectId: 'proj-2',
      commitHash: 'def456',
      status: 'building',
      timestamp: '2024-01-25T11:15:00Z',
      logs: 'Installing dependencies...\nBuilding application...'
    },
    {
      deploymentId: 'dep-3',
      projectId: 'proj-3',
      commitHash: 'ghi789',
      status: 'failed',
      timestamp: '2024-01-25T09:45:00Z',
      logs: 'Error: Build failed\nPackage installation failed'
    }
  ])

  const createProject = (projectData) => {
    const newProject = {
      projectId: `proj-${Date.now()}`,
      userId: user.userId,
      ...projectData,
      createdAt: new Date().toISOString(),
      status: 'created',
      lastDeployment: null
    }
    setProjects(prev => [...prev, newProject])
    return newProject
  }

  const deployProject = (projectId, commitHash = 'latest') => {
    const deployment = {
      deploymentId: `dep-${Date.now()}`,
      projectId,
      commitHash,
      status: 'building',
      timestamp: new Date().toISOString(),
      logs: 'Starting deployment...\nFetching latest code...'
    }
    
    setDeployments(prev => [...prev, deployment])
    
    // Update project status
    setProjects(prev => prev.map(p => 
      p.projectId === projectId 
        ? { ...p, status: 'building', lastDeployment: deployment.timestamp }
        : p
    ))
    
    // Simulate deployment process
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate
      const finalStatus = success ? 'success' : 'failed'
      
      setDeployments(prev => prev.map(d => 
        d.deploymentId === deployment.deploymentId
          ? { 
              ...d, 
              status: finalStatus,
              logs: success 
                ? 'Build completed successfully\nDeployment to production environment completed'
                : 'Error: Build failed\nDeployment failed - please check logs'
            }
          : d
      ))
      
      setProjects(prev => prev.map(p => 
        p.projectId === projectId 
          ? { ...p, status: success ? 'deployed' : 'failed' }
          : p
      ))
    }, 3000)
    
    return deployment
  }

  const rollbackDeployment = (projectId) => {
    const projectDeployments = deployments
      .filter(d => d.projectId === projectId && d.status === 'success')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    if (projectDeployments.length > 1) {
      const previousDeployment = projectDeployments[1]
      return deployProject(projectId, previousDeployment.commitHash)
    }
    return null
  }

  const value = {
    user,
    projects,
    deployments,
    createProject,
    deployProject,
    rollbackDeployment,
    stats: {
      totalProjects: projects.length,
      activeDeployments: deployments.filter(d => d.status === 'building').length,
      successfulDeployments: deployments.filter(d => d.status === 'success').length,
      failedDeployments: deployments.filter(d => d.status === 'failed').length
    }
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}