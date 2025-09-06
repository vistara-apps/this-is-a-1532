/**
 * Health Monitoring and Deployment Status Tracking System
 * Provides real-time monitoring of deployments and application health
 */

import apiService from './api'
import errorHandler, { DeploymentError } from '../utils/errorHandler'

class HealthMonitor {
  constructor() {
    this.activeMonitors = new Map()
    this.healthChecks = new Map()
    this.subscribers = new Map()
    this.checkInterval = 30000 // 30 seconds
    this.maxRetries = 3
  }

  // Start monitoring a deployment
  startMonitoring(deploymentId, projectId, options = {}) {
    const monitorConfig = {
      deploymentId,
      projectId,
      interval: options.interval || this.checkInterval,
      retries: 0,
      maxRetries: options.maxRetries || this.maxRetries,
      healthEndpoint: options.healthEndpoint,
      expectedStatus: options.expectedStatus || 200,
      timeout: options.timeout || 10000,
      startTime: Date.now(),
      lastCheck: null,
      status: 'monitoring',
      metrics: {
        uptime: 0,
        responseTime: [],
        errorCount: 0,
        successCount: 0,
      }
    }

    this.activeMonitors.set(deploymentId, monitorConfig)
    this.scheduleHealthCheck(deploymentId)
    
    return monitorConfig
  }

  // Stop monitoring a deployment
  stopMonitoring(deploymentId) {
    const monitor = this.activeMonitors.get(deploymentId)
    if (monitor && monitor.intervalId) {
      clearInterval(monitor.intervalId)
    }
    this.activeMonitors.delete(deploymentId)
    this.healthChecks.delete(deploymentId)
  }

  // Schedule periodic health checks
  scheduleHealthCheck(deploymentId) {
    const monitor = this.activeMonitors.get(deploymentId)
    if (!monitor) return

    monitor.intervalId = setInterval(async () => {
      await this.performHealthCheck(deploymentId)
    }, monitor.interval)

    // Perform initial check immediately
    this.performHealthCheck(deploymentId)
  }

  // Perform a single health check
  async performHealthCheck(deploymentId) {
    const monitor = this.activeMonitors.get(deploymentId)
    if (!monitor) return

    const startTime = Date.now()
    
    try {
      // Get deployment status from API
      const deploymentStatus = await apiService.request(`/deployments/${deploymentId}/status`)
      
      // Perform application health check if deployment is running
      let healthResult = null
      if (deploymentStatus.status === 'running' && monitor.healthEndpoint) {
        healthResult = await this.checkApplicationHealth(monitor.healthEndpoint, monitor.timeout)
      }

      const responseTime = Date.now() - startTime
      
      // Update metrics
      monitor.metrics.responseTime.push(responseTime)
      if (monitor.metrics.responseTime.length > 100) {
        monitor.metrics.responseTime = monitor.metrics.responseTime.slice(-100)
      }

      const isHealthy = this.evaluateHealth(deploymentStatus, healthResult, monitor)
      
      if (isHealthy) {
        monitor.metrics.successCount++
        monitor.retries = 0 // Reset retry count on success
      } else {
        monitor.metrics.errorCount++
        monitor.retries++
      }

      // Update monitor status
      monitor.lastCheck = Date.now()
      monitor.status = isHealthy ? 'healthy' : 'unhealthy'
      monitor.uptime = ((monitor.metrics.successCount / (monitor.metrics.successCount + monitor.metrics.errorCount)) * 100).toFixed(2)

      // Store health check result
      const healthCheckResult = {
        timestamp: Date.now(),
        deploymentId,
        projectId: monitor.projectId,
        status: monitor.status,
        responseTime,
        deploymentStatus: deploymentStatus.status,
        healthResult,
        metrics: { ...monitor.metrics }
      }

      this.healthChecks.set(`${deploymentId}-${Date.now()}`, healthCheckResult)
      
      // Notify subscribers
      this.notifySubscribers(deploymentId, healthCheckResult)

      // Handle unhealthy deployments
      if (!isHealthy) {
        await this.handleUnhealthyDeployment(deploymentId, monitor, healthCheckResult)
      }

      // Auto-rollback if configured and deployment is consistently failing
      if (monitor.retries >= monitor.maxRetries && monitor.autoRollback) {
        await this.triggerAutoRollback(deploymentId, monitor)
      }

    } catch (error) {
      monitor.metrics.errorCount++
      monitor.retries++
      monitor.status = 'error'
      
      const healthCheckResult = {
        timestamp: Date.now(),
        deploymentId,
        projectId: monitor.projectId,
        status: 'error',
        error: error.message,
        metrics: { ...monitor.metrics }
      }

      this.healthChecks.set(`${deploymentId}-${Date.now()}`, healthCheckResult)
      this.notifySubscribers(deploymentId, healthCheckResult)

      errorHandler.handleError(
        new DeploymentError('Health check failed', monitor.projectId, deploymentId, 'health_check'),
        { deploymentId, error: error.message }
      )
    }
  }

  // Check application health endpoint
  async checkApplicationHealth(healthEndpoint, timeout) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'DeployGenie-HealthMonitor/1.0'
        }
      })

      clearTimeout(timeoutId)

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: response.status === 200 ? await response.text().catch(() => '') : null
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Evaluate overall health based on deployment and application status
  evaluateHealth(deploymentStatus, healthResult, monitor) {
    // Check deployment status
    if (deploymentStatus.status === 'failed' || deploymentStatus.status === 'error') {
      return false
    }

    if (deploymentStatus.status !== 'running') {
      return true // Still deploying, consider healthy for now
    }

    // Check application health if endpoint is configured
    if (monitor.healthEndpoint && healthResult) {
      return healthResult.status === monitor.expectedStatus
    }

    // If no health endpoint, consider healthy if deployment is running
    return deploymentStatus.status === 'running'
  }

  // Handle unhealthy deployments
  async handleUnhealthyDeployment(deploymentId, monitor, healthCheckResult) {
    try {
      // Log the unhealthy state
      console.warn(`Deployment ${deploymentId} is unhealthy:`, healthCheckResult)

      // Send alert notification
      await this.sendAlert(deploymentId, monitor, healthCheckResult)

      // If configured, attempt automatic remediation
      if (monitor.autoRemediation) {
        await this.attemptRemediation(deploymentId, monitor)
      }

    } catch (error) {
      errorHandler.handleError(error, { 
        action: 'handle_unhealthy_deployment',
        deploymentId,
        projectId: monitor.projectId
      })
    }
  }

  // Trigger automatic rollback
  async triggerAutoRollback(deploymentId, monitor) {
    try {
      console.log(`Triggering auto-rollback for deployment ${deploymentId}`)
      
      const rollbackResult = await apiService.rollbackDeployment(monitor.projectId, deploymentId)
      
      // Stop monitoring the failed deployment
      this.stopMonitoring(deploymentId)
      
      // Start monitoring the rollback deployment
      if (rollbackResult.deploymentId) {
        this.startMonitoring(rollbackResult.deploymentId, monitor.projectId, {
          ...monitor,
          autoRollback: false // Prevent infinite rollback loops
        })
      }

      // Notify subscribers about the rollback
      this.notifySubscribers(deploymentId, {
        timestamp: Date.now(),
        deploymentId,
        projectId: monitor.projectId,
        status: 'rolled_back',
        rollbackDeploymentId: rollbackResult.deploymentId
      })

    } catch (error) {
      errorHandler.handleError(
        new DeploymentError('Auto-rollback failed', monitor.projectId, deploymentId, 'auto_rollback'),
        { error: error.message }
      )
    }
  }

  // Send alert notifications
  async sendAlert(deploymentId, monitor, healthCheckResult) {
    try {
      await apiService.request('/notifications/alert', {
        method: 'POST',
        body: JSON.stringify({
          type: 'deployment_unhealthy',
          deploymentId,
          projectId: monitor.projectId,
          severity: monitor.retries >= monitor.maxRetries ? 'critical' : 'warning',
          message: `Deployment ${deploymentId} health check failed`,
          details: healthCheckResult
        })
      })
    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  // Attempt automatic remediation
  async attemptRemediation(deploymentId, monitor) {
    try {
      // Restart the deployment
      await apiService.request(`/deployments/${deploymentId}/restart`, {
        method: 'POST'
      })

      console.log(`Attempted remediation for deployment ${deploymentId}`)
    } catch (error) {
      console.error('Remediation failed:', error)
    }
  }

  // Subscribe to health check updates
  subscribe(deploymentId, callback) {
    if (!this.subscribers.has(deploymentId)) {
      this.subscribers.set(deploymentId, new Set())
    }
    this.subscribers.get(deploymentId).add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(deploymentId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.subscribers.delete(deploymentId)
        }
      }
    }
  }

  // Notify subscribers of health check updates
  notifySubscribers(deploymentId, healthCheckResult) {
    const callbacks = this.subscribers.get(deploymentId)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(healthCheckResult)
        } catch (error) {
          console.error('Error in health monitor callback:', error)
        }
      })
    }
  }

  // Get current health status for a deployment
  getHealthStatus(deploymentId) {
    return this.activeMonitors.get(deploymentId)
  }

  // Get health history for a deployment
  getHealthHistory(deploymentId, limit = 50) {
    const history = []
    for (const [key, result] of this.healthChecks.entries()) {
      if (result.deploymentId === deploymentId) {
        history.push(result)
      }
    }
    
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // Get metrics for a deployment
  getMetrics(deploymentId) {
    const monitor = this.activeMonitors.get(deploymentId)
    if (!monitor) return null

    const responseTime = monitor.metrics.responseTime
    const avgResponseTime = responseTime.length > 0 
      ? responseTime.reduce((a, b) => a + b, 0) / responseTime.length 
      : 0

    return {
      uptime: monitor.uptime,
      avgResponseTime: Math.round(avgResponseTime),
      totalChecks: monitor.metrics.successCount + monitor.metrics.errorCount,
      successCount: monitor.metrics.successCount,
      errorCount: monitor.metrics.errorCount,
      lastCheck: monitor.lastCheck,
      status: monitor.status
    }
  }

  // Clean up old health check data
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge
    
    for (const [key, result] of this.healthChecks.entries()) {
      if (result.timestamp < cutoff) {
        this.healthChecks.delete(key)
      }
    }
  }

  // Stop all monitoring
  stopAll() {
    for (const deploymentId of this.activeMonitors.keys()) {
      this.stopMonitoring(deploymentId)
    }
  }
}

// Create singleton instance
const healthMonitor = new HealthMonitor()

// Clean up old data periodically
setInterval(() => {
  healthMonitor.cleanup()
}, 60 * 60 * 1000) // Every hour

export default healthMonitor
