/**
 * API Service Layer for DeployGenie
 * Handles all external API integrations including GitHub, Docker, Cloud Providers, and Stripe
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('auth_token')
  }

  // Generic HTTP request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    if (response.token) {
      this.token = response.token
      localStorage.setItem('auth_token', response.token)
    }
    
    return response
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' })
    this.token = null
    localStorage.removeItem('auth_token')
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  // GitHub API integration
  async connectGitHub(code) {
    return this.request('/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getGitHubRepos() {
    return this.request('/github/repos')
  }

  async getRepoDetails(owner, repo) {
    return this.request(`/github/repos/${owner}/${repo}`)
  }

  async createWebhook(owner, repo, webhookUrl) {
    return this.request(`/github/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push', 'pull_request'],
        config: {
          url: webhookUrl,
          content_type: 'json',
        },
      }),
    })
  }

  // Project management
  async getProjects() {
    return this.request('/projects')
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async updateProject(projectId, updates) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  // Deployment management
  async getDeployments(projectId = null) {
    const endpoint = projectId ? `/deployments?projectId=${projectId}` : '/deployments'
    return this.request(endpoint)
  }

  async createDeployment(deploymentData) {
    return this.request('/deployments', {
      method: 'POST',
      body: JSON.stringify(deploymentData),
    })
  }

  async getDeploymentLogs(deploymentId) {
    return this.request(`/deployments/${deploymentId}/logs`)
  }

  async rollbackDeployment(projectId, targetDeploymentId) {
    return this.request(`/projects/${projectId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ targetDeploymentId }),
    })
  }

  // Health checks and monitoring
  async getProjectHealth(projectId) {
    return this.request(`/projects/${projectId}/health`)
  }

  async getDeploymentMetrics(deploymentId) {
    return this.request(`/deployments/${deploymentId}/metrics`)
  }

  // Cloud provider integrations
  async getCloudProviders() {
    return this.request('/cloud-providers')
  }

  async connectCloudProvider(provider, credentials) {
    return this.request('/cloud-providers/connect', {
      method: 'POST',
      body: JSON.stringify({ provider, credentials }),
    })
  }

  async getEnvironments(projectId) {
    return this.request(`/projects/${projectId}/environments`)
  }

  async createEnvironment(projectId, environmentData) {
    return this.request(`/projects/${projectId}/environments`, {
      method: 'POST',
      body: JSON.stringify(environmentData),
    })
  }

  // Container registry operations
  async pushToRegistry(imageData) {
    return this.request('/registry/push', {
      method: 'POST',
      body: JSON.stringify(imageData),
    })
  }

  async getRegistryImages(projectId) {
    return this.request(`/registry/images?projectId=${projectId}`)
  }

  // Subscription and billing (Stripe integration)
  async getSubscription() {
    return this.request('/billing/subscription')
  }

  async createSubscription(planId, paymentMethodId) {
    return this.request('/billing/subscription', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethodId }),
    })
  }

  async updateSubscription(subscriptionId, updates) {
    return this.request(`/billing/subscription/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async cancelSubscription(subscriptionId) {
    return this.request(`/billing/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
    })
  }

  async getInvoices() {
    return this.request('/billing/invoices')
  }

  async createPaymentMethod(paymentMethodData) {
    return this.request('/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    })
  }

  // Analytics and usage
  async getUsageStats(timeframe = '30d') {
    return this.request(`/analytics/usage?timeframe=${timeframe}`)
  }

  async getDeploymentStats(projectId = null, timeframe = '30d') {
    const endpoint = projectId 
      ? `/analytics/deployments?projectId=${projectId}&timeframe=${timeframe}`
      : `/analytics/deployments?timeframe=${timeframe}`
    return this.request(endpoint)
  }

  // Notifications and webhooks
  async getNotificationSettings() {
    return this.request('/notifications/settings')
  }

  async updateNotificationSettings(settings) {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async testWebhook(webhookUrl, payload) {
    return this.request('/webhooks/test', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl, payload }),
    })
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService

// Export individual methods for easier importing
export const {
  login,
  logout,
  getCurrentUser,
  connectGitHub,
  getGitHubRepos,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getDeployments,
  createDeployment,
  getDeploymentLogs,
  rollbackDeployment,
  getProjectHealth,
  getSubscription,
  createSubscription,
  getUsageStats,
} = apiService
