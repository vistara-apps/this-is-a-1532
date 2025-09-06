/**
 * Centralized Error Handling and Validation System for DeployGenie
 */

// Error types for better categorization
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  DEPLOYMENT: 'DEPLOYMENT_ERROR',
  GITHUB: 'GITHUB_ERROR',
  BILLING: 'BILLING_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}

// Custom error classes
export class DeployGenieError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, details = {}) {
    super(message)
    this.name = 'DeployGenieError'
    this.type = type
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export class ValidationError extends DeployGenieError {
  constructor(message, field = null, value = null) {
    super(message, ErrorTypes.VALIDATION, { field, value })
    this.name = 'ValidationError'
  }
}

export class NetworkError extends DeployGenieError {
  constructor(message, status = null, endpoint = null) {
    super(message, ErrorTypes.NETWORK, { status, endpoint })
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends DeployGenieError {
  constructor(message, action = null) {
    super(message, ErrorTypes.AUTHENTICATION, { action })
    this.name = 'AuthenticationError'
  }
}

export class DeploymentError extends DeployGenieError {
  constructor(message, projectId = null, deploymentId = null, stage = null) {
    super(message, ErrorTypes.DEPLOYMENT, { projectId, deploymentId, stage })
    this.name = 'DeploymentError'
  }
}

// Error handler class
class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 100
    this.notificationCallbacks = []
  }

  // Add notification callback for UI updates
  addNotificationCallback(callback) {
    this.notificationCallbacks.push(callback)
  }

  // Remove notification callback
  removeNotificationCallback(callback) {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback)
  }

  // Log error to internal log
  logError(error) {
    const errorEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      message: error.message,
      type: error.type || ErrorTypes.UNKNOWN,
      details: error.details || {},
      stack: error.stack,
    }

    this.errorLog.unshift(errorEntry)
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Send to external logging service in production
    if (import.meta.env.PROD) {
      this.sendToLoggingService(errorEntry)
    }

    return errorEntry
  }

  // Handle different types of errors
  handleError(error, context = {}) {
    let processedError = error

    // Convert generic errors to DeployGenie errors
    if (!(error instanceof DeployGenieError)) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        processedError = new NetworkError('Network connection failed', null, context.endpoint)
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        processedError = new AuthenticationError('Authentication required', context.action)
      } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
        processedError = new ValidationError('Invalid request data', context.field, context.value)
      } else {
        processedError = new DeployGenieError(error.message, ErrorTypes.UNKNOWN, context)
      }
    }

    // Log the error
    const errorEntry = this.logError(processedError)

    // Notify UI components
    this.notifyComponents(processedError, errorEntry)

    // Handle specific error types
    this.handleSpecificError(processedError, context)

    return processedError
  }

  // Handle specific error types with custom logic
  handleSpecificError(error, context) {
    switch (error.type) {
      case ErrorTypes.AUTHENTICATION:
        this.handleAuthError(error, context)
        break
      case ErrorTypes.DEPLOYMENT:
        this.handleDeploymentError(error, context)
        break
      case ErrorTypes.NETWORK:
        this.handleNetworkError(error, context)
        break
      case ErrorTypes.GITHUB:
        this.handleGitHubError(error, context)
        break
      case ErrorTypes.BILLING:
        this.handleBillingError(error, context)
        break
      default:
        console.error('Unhandled error:', error)
    }
  }

  // Specific error handlers
  handleAuthError(error, context) {
    // Clear auth token if it's invalid
    if (error.message.includes('token') || error.message.includes('unauthorized')) {
      localStorage.removeItem('auth_token')
      // Redirect to login if needed
      if (context.redirectToLogin !== false) {
        window.location.href = '/login'
      }
    }
  }

  handleDeploymentError(error, context) {
    // Log deployment failure for analytics
    console.error('Deployment failed:', {
      projectId: error.details.projectId,
      deploymentId: error.details.deploymentId,
      stage: error.details.stage,
      message: error.message,
    })
  }

  handleNetworkError(error, context) {
    // Implement retry logic for network errors
    if (context.retry && context.retryCount < 3) {
      setTimeout(() => {
        context.retryFunction()
      }, Math.pow(2, context.retryCount) * 1000) // Exponential backoff
    }
  }

  handleGitHubError(error, context) {
    // Handle GitHub API rate limiting
    if (error.message.includes('rate limit')) {
      console.warn('GitHub API rate limit exceeded')
    }
  }

  handleBillingError(error, context) {
    // Handle billing-related errors
    if (error.message.includes('payment') || error.message.includes('subscription')) {
      console.error('Billing error:', error.message)
    }
  }

  // Notify UI components about errors
  notifyComponents(error, errorEntry) {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(error, errorEntry)
      } catch (callbackError) {
        console.error('Error in notification callback:', callbackError)
      }
    })
  }

  // Send error to external logging service
  async sendToLoggingService(errorEntry) {
    try {
      // In a real app, this would send to services like Sentry, LogRocket, etc.
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEntry),
      })
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError)
    }
  }

  // Get error log for debugging
  getErrorLog() {
    return [...this.errorLog]
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = []
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error) {
    const friendlyMessages = {
      [ErrorTypes.NETWORK]: 'Connection problem. Please check your internet connection and try again.',
      [ErrorTypes.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
      [ErrorTypes.DEPLOYMENT]: 'Deployment failed. Please check your project configuration.',
      [ErrorTypes.GITHUB]: 'GitHub connection issue. Please check your repository permissions.',
      [ErrorTypes.BILLING]: 'Billing issue. Please check your subscription status.',
      [ErrorTypes.UNKNOWN]: 'Something went wrong. Please try again.',
    }

    return friendlyMessages[error.type] || error.message || 'An unexpected error occurred.'
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler()

// Validation utilities
export const validators = {
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new ValidationError(`${fieldName} is required`, fieldName, value)
    }
    return true
  },

  email: (value, fieldName = 'Email') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid email address`, fieldName, value)
    }
    return true
  },

  url: (value, fieldName = 'URL') => {
    try {
      new URL(value)
      return true
    } catch {
      throw new ValidationError(`${fieldName} must be a valid URL`, fieldName, value)
    }
  },

  githubRepo: (value, fieldName = 'Repository URL') => {
    const githubRegex = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+$/
    if (!githubRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid GitHub repository URL`, fieldName, value)
    }
    return true
  },

  projectName: (value, fieldName = 'Project name') => {
    if (value.length < 3 || value.length > 50) {
      throw new ValidationError(`${fieldName} must be between 3 and 50 characters`, fieldName, value)
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
      throw new ValidationError(`${fieldName} can only contain letters, numbers, spaces, hyphens, and underscores`, fieldName, value)
    }
    return true
  },

  deploymentConfig: (config, fieldName = 'Deployment configuration') => {
    if (!config || typeof config !== 'object') {
      throw new ValidationError(`${fieldName} must be a valid configuration object`, fieldName, config)
    }
    if (!config.framework) {
      throw new ValidationError('Framework is required in deployment configuration', 'framework', config.framework)
    }
    if (!config.buildCommand) {
      throw new ValidationError('Build command is required in deployment configuration', 'buildCommand', config.buildCommand)
    }
    return true
  },
}

// Validation helper function
export const validateForm = (data, rules) => {
  const errors = {}
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    try {
      const value = data[field]
      
      for (const rule of fieldRules) {
        if (typeof rule === 'function') {
          rule(value, field)
        } else if (typeof rule === 'string' && validators[rule]) {
          validators[rule](value, field)
        }
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        errors[field] = error.message
      }
    }
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Form validation failed', null, errors)
  }
  
  return true
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, { source: 'unhandledrejection' })
})

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, { source: 'uncaught', filename: event.filename, lineno: event.lineno })
})

export default errorHandler
