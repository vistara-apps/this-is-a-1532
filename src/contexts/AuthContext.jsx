import React, { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../services/api'
import errorHandler, { AuthenticationError } from '../utils/errorHandler'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
        setGithubConnected(!!userData.githubToken)
      }
    } catch (error) {
      // Token might be invalid, clear it
      localStorage.removeItem('auth_token')
      errorHandler.handleError(error, { action: 'initialize_auth', redirectToLogin: false })
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await apiService.login(credentials)
      
      setUser(response.user)
      setIsAuthenticated(true)
      setGithubConnected(!!response.user.githubToken)
      
      return response
    } catch (error) {
      const authError = new AuthenticationError('Login failed', 'login')
      errorHandler.handleError(authError, { redirectToLogin: false })
      throw authError
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setGithubConnected(false)
      localStorage.removeItem('auth_token')
    }
  }

  const connectGitHub = async () => {
    try {
      // Generate GitHub OAuth URL
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      const redirectUri = `${window.location.origin}/auth/github/callback`
      const scope = 'repo,user:email,read:org'
      const state = Math.random().toString(36).substring(2, 15)
      
      // Store state for verification
      localStorage.setItem('github_oauth_state', state)
      
      const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`
      
      // Open GitHub OAuth in popup or redirect
      if (window.innerWidth > 768) {
        // Desktop: use popup
        const popup = window.open(
          githubUrl,
          'github-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        )
        
        return new Promise((resolve, reject) => {
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed)
              // Check if connection was successful
              setTimeout(async () => {
                try {
                  const updatedUser = await apiService.getCurrentUser()
                  if (updatedUser.githubToken) {
                    setUser(updatedUser)
                    setGithubConnected(true)
                    resolve(updatedUser)
                  } else {
                    reject(new Error('GitHub connection was cancelled'))
                  }
                } catch (error) {
                  reject(error)
                }
              }, 1000)
            }
          }, 1000)
        })
      } else {
        // Mobile: use redirect
        window.location.href = githubUrl
      }
    } catch (error) {
      const githubError = new AuthenticationError('Failed to connect GitHub', 'github_connect')
      errorHandler.handleError(githubError)
      throw githubError
    }
  }

  const handleGitHubCallback = async (code, state) => {
    try {
      // Verify state parameter
      const storedState = localStorage.getItem('github_oauth_state')
      if (state !== storedState) {
        throw new AuthenticationError('Invalid OAuth state parameter', 'github_callback')
      }
      
      // Clear stored state
      localStorage.removeItem('github_oauth_state')
      
      // Exchange code for token
      const response = await apiService.connectGitHub(code)
      
      setUser(response.user)
      setGithubConnected(true)
      
      return response
    } catch (error) {
      const githubError = new AuthenticationError('GitHub connection failed', 'github_callback')
      errorHandler.handleError(githubError)
      throw githubError
    }
  }

  const disconnectGitHub = async () => {
    try {
      await apiService.request('/auth/github/disconnect', { method: 'POST' })
      
      const updatedUser = { ...user, githubToken: null }
      setUser(updatedUser)
      setGithubConnected(false)
    } catch (error) {
      errorHandler.handleError(error, { action: 'github_disconnect' })
      throw error
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await apiService.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      
      setUser(response.user)
      setIsAuthenticated(true)
      setGithubConnected(false)
      
      return response
    } catch (error) {
      const authError = new AuthenticationError('Registration failed', 'register')
      errorHandler.handleError(authError, { redirectToLogin: false })
      throw authError
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const response = await apiService.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      
      setUser(response.user)
      return response
    } catch (error) {
      errorHandler.handleError(error, { action: 'update_profile' })
      throw error
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiService.request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
    } catch (error) {
      const authError = new AuthenticationError('Password change failed', 'change_password')
      errorHandler.handleError(authError)
      throw authError
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      await apiService.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    } catch (error) {
      errorHandler.handleError(error, { action: 'forgot_password' })
      throw error
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await apiService.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      })
      
      setUser(response.user)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      const authError = new AuthenticationError('Password reset failed', 'reset_password')
      errorHandler.handleError(authError)
      throw authError
    }
  }

  const refreshToken = async () => {
    try {
      const response = await apiService.request('/auth/refresh', { method: 'POST' })
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token)
        apiService.token = response.token
      }
      
      return response
    } catch (error) {
      // If refresh fails, user needs to log in again
      await logout()
      throw new AuthenticationError('Session expired', 'refresh_token')
    }
  }

  // Check if user has specific permissions
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(permission) || user.permissions.includes('admin')
  }

  // Check subscription status
  const hasActiveSubscription = () => {
    return user && user.subscriptionTier && user.subscriptionTier !== 'free'
  }

  const canCreateProject = () => {
    if (!user) return false
    
    // Free tier limitations
    if (user.subscriptionTier === 'free') {
      return user.projectCount < 3 // Free tier limit
    }
    
    return true
  }

  const canDeploy = () => {
    if (!user) return false
    
    // Check if GitHub is connected
    if (!githubConnected) return false
    
    // Free tier limitations
    if (user.subscriptionTier === 'free') {
      const today = new Date().toDateString()
      const deploymentsToday = user.dailyDeployments?.[today] || 0
      return deploymentsToday < 5 // Free tier daily limit
    }
    
    return true
  }

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    githubConnected,
    
    // Actions
    login,
    logout,
    register,
    connectGitHub,
    handleGitHubCallback,
    disconnectGitHub,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshToken,
    
    // Utilities
    hasPermission,
    hasActiveSubscription,
    canCreateProject,
    canDeploy,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
