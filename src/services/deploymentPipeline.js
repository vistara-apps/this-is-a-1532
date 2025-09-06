/**
 * Advanced Deployment Pipeline Automation System
 * Handles the complete deployment lifecycle with automated environment setup,
 * build processes, testing, and deployment to various cloud providers
 */

import apiService from './api'
import healthMonitor from './healthMonitor'
import errorHandler, { DeploymentError } from '../utils/errorHandler'

// Deployment stages
export const DEPLOYMENT_STAGES = {
  INITIALIZING: 'initializing',
  CLONING: 'cloning',
  ANALYZING: 'analyzing',
  INSTALLING: 'installing',
  BUILDING: 'building',
  TESTING: 'testing',
  CONTAINERIZING: 'containerizing',
  PUSHING: 'pushing',
  DEPLOYING: 'deploying',
  HEALTH_CHECK: 'health_check',
  SUCCESS: 'success',
  FAILED: 'failed',
  ROLLING_BACK: 'rolling_back'
}

// Supported frameworks and their configurations
export const FRAMEWORK_CONFIGS = {
  react: {
    name: 'React',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    testCommand: 'npm test',
    outputDir: 'build',
    port: 3000,
    healthEndpoint: '/health',
    dockerfile: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]'
  },
  nextjs: {
    name: 'Next.js',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    testCommand: 'npm test',
    outputDir: '.next',
    port: 3000,
    healthEndpoint: '/api/health',
    dockerfile: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]'
  },
  vue: {
    name: 'Vue.js',
    buildCommand: 'npm run build',
    startCommand: 'npm run serve',
    testCommand: 'npm test',
    outputDir: 'dist',
    port: 8080,
    healthEndpoint: '/health',
    dockerfile: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nRUN npm run build\nEXPOSE 8080\nCMD ["npm", "run", "serve"]'
  },
  nodejs: {
    name: 'Node.js',
    buildCommand: 'npm install',
    startCommand: 'npm start',
    testCommand: 'npm test',
    outputDir: null,
    port: 3000,
    healthEndpoint: '/health',
    dockerfile: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]'
  },
  python: {
    name: 'Python',
    buildCommand: 'pip install -r requirements.txt',
    startCommand: 'python app.py',
    testCommand: 'python -m pytest',
    outputDir: null,
    port: 5000,
    healthEndpoint: '/health',
    dockerfile: 'FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 5000\nCMD ["python", "app.py"]'
  }
}

// Cloud provider configurations
export const CLOUD_PROVIDERS = {
  vercel: {
    name: 'Vercel',
    type: 'serverless',
    supports: ['react', 'nextjs', 'vue'],
    regions: ['us-east-1', 'us-west-2', 'eu-west-1']
  },
  netlify: {
    name: 'Netlify',
    type: 'static',
    supports: ['react', 'vue'],
    regions: ['us-east-1', 'eu-west-1']
  },
  aws: {
    name: 'AWS',
    type: 'container',
    supports: ['react', 'nextjs', 'vue', 'nodejs', 'python'],
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
  },
  gcp: {
    name: 'Google Cloud',
    type: 'container',
    supports: ['react', 'nextjs', 'vue', 'nodejs', 'python'],
    regions: ['us-central1', 'us-east1', 'europe-west1', 'asia-southeast1']
  },
  digitalocean: {
    name: 'DigitalOcean',
    type: 'container',
    supports: ['react', 'nextjs', 'vue', 'nodejs', 'python'],
    regions: ['nyc1', 'sfo3', 'ams3', 'sgp1']
  }
}

class DeploymentPipeline {
  constructor() {
    this.activeDeployments = new Map()
    this.deploymentHistory = new Map()
    this.subscribers = new Map()
  }

  // Start a new deployment
  async startDeployment(projectId, options = {}) {
    const deploymentId = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const deployment = {
      deploymentId,
      projectId,
      status: DEPLOYMENT_STAGES.INITIALIZING,
      startTime: Date.now(),
      endTime: null,
      currentStage: DEPLOYMENT_STAGES.INITIALIZING,
      stages: {},
      logs: [],
      options: {
        branch: options.branch || 'main',
        environment: options.environment || 'production',
        provider: options.provider || 'vercel',
        region: options.region,
        autoRollback: options.autoRollback !== false,
        runTests: options.runTests !== false,
        ...options
      },
      metadata: {
        commitHash: null,
        buildArtifacts: [],
        deploymentUrl: null,
        healthEndpoint: null
      }
    }

    this.activeDeployments.set(deploymentId, deployment)
    
    // Start the deployment process
    this.executeDeployment(deploymentId).catch(error => {
      this.handleDeploymentError(deploymentId, error)
    })

    return deployment
  }

  // Execute the complete deployment pipeline
  async executeDeployment(deploymentId) {
    const deployment = this.activeDeployments.get(deploymentId)
    if (!deployment) throw new Error('Deployment not found')

    try {
      // Stage 1: Initialize and validate
      await this.executeStage(deploymentId, DEPLOYMENT_STAGES.INITIALIZING, async () => {
        await this.initializeDeployment(deployment)
      })

      // Stage 2: Clone repository
      await this.executeStage(deploymentId, DEPLOYMENT_STAGES.CLONING, async () => {
        await this.cloneRepository(deployment)
      })

      // Stage 3: Analyze project structure
      await this.executeStage(deploymentId, DEPLOYMENT_STAGES.ANALYZING, async () => {
        await this.analyzeProject(deployment)
      })

      // Stage 4: Install dependencies
      await this.executeStage(deploymentId, DEPLOYMENT_STAGES.INSTALLING, async () => {
        await this.installDependencies(deployment)
      })

      // Stage 5: Run tests (if enabled)
      if (deployment.options.runTests) {
        await this.executeStage(deploymentId, DEPLOYMENT_STAGES.TESTING, async () => {
          await this.runTests(deployment)
        })
      }

      // Stage 6: Build application
      await this.executeStage(deploymentId, DEPLOYMENT_STAGES.BUILDING, async () => {
        await this.buildApplication(deployment)
      })

      // Stage 7: Containerize (if needed)
      if (this.requiresContainerization(deployment)) {
        await this.executeStage(deploymentId, DEPLOYMENT_STAGES.CONTAINERIZING, async () => {
          await this.containerizeApplication(deployment)
        })

        // Stage 8: Push to registry
        await this.executeStage(deploymentId, DEPLOYMENT_STAGES.PUSHING, async () => {
          await this.pushToRegistry(deployment)
        })
      }

      // Stage 9: Deploy to cloud provider
      await this.executeStage(deploymentId, DEPLOYMENT_STAGES.DEPLOYING, async () => {
        await this.deployToProvider(deployment)
      })

      // Stage 10: Health check
      await this.executeStage(deploymentId, DEPLOYMENT_STAGES.HEALTH_CHECK, async () => {
        await this.performHealthCheck(deployment)
      })

      // Mark as successful
      await this.completeDeployment(deploymentId, DEPLOYMENT_STAGES.SUCCESS)

    } catch (error) {
      await this.handleDeploymentError(deploymentId, error)
    }
  }

  // Execute a single deployment stage
  async executeStage(deploymentId, stage, stageFunction) {
    const deployment = this.activeDeployments.get(deploymentId)
    if (!deployment) throw new Error('Deployment not found')

    const stageStart = Date.now()
    deployment.currentStage = stage
    deployment.stages[stage] = {
      status: 'running',
      startTime: stageStart,
      endTime: null,
      logs: []
    }

    this.addLog(deploymentId, `Starting stage: ${stage}`, 'info')
    this.notifySubscribers(deploymentId, { stage, status: 'running' })

    try {
      await stageFunction()
      
      const stageEnd = Date.now()
      deployment.stages[stage].status = 'success'
      deployment.stages[stage].endTime = stageEnd
      
      this.addLog(deploymentId, `Completed stage: ${stage} (${stageEnd - stageStart}ms)`, 'success')
      this.notifySubscribers(deploymentId, { stage, status: 'success' })
      
    } catch (error) {
      const stageEnd = Date.now()
      deployment.stages[stage].status = 'failed'
      deployment.stages[stage].endTime = stageEnd
      deployment.stages[stage].error = error.message
      
      this.addLog(deploymentId, `Failed stage: ${stage} - ${error.message}`, 'error')
      this.notifySubscribers(deploymentId, { stage, status: 'failed', error: error.message })
      
      throw error
    }
  }

  // Initialize deployment
  async initializeDeployment(deployment) {
    // Get project details
    const project = await apiService.request(`/projects/${deployment.projectId}`)
    deployment.project = project

    // Validate configuration
    if (!project.repoUrl) {
      throw new Error('Repository URL is required')
    }

    // Check cloud provider availability
    const provider = CLOUD_PROVIDERS[deployment.options.provider]
    if (!provider) {
      throw new Error(`Unsupported cloud provider: ${deployment.options.provider}`)
    }

    this.addLog(deployment.deploymentId, `Initialized deployment for ${project.projectName}`)
  }

  // Clone repository
  async cloneRepository(deployment) {
    const response = await apiService.request('/deployment/clone', {
      method: 'POST',
      body: JSON.stringify({
        repoUrl: deployment.project.repoUrl,
        branch: deployment.options.branch,
        deploymentId: deployment.deploymentId
      })
    })

    deployment.metadata.commitHash = response.commitHash
    this.addLog(deployment.deploymentId, `Cloned repository at commit ${response.commitHash}`)
  }

  // Analyze project structure
  async analyzeProject(deployment) {
    const analysis = await apiService.request('/deployment/analyze', {
      method: 'POST',
      body: JSON.stringify({
        deploymentId: deployment.deploymentId
      })
    })

    deployment.framework = analysis.framework
    deployment.frameworkConfig = FRAMEWORK_CONFIGS[analysis.framework]
    
    if (!deployment.frameworkConfig) {
      throw new Error(`Unsupported framework: ${analysis.framework}`)
    }

    // Override with custom configuration if provided
    if (deployment.project.deployConfig) {
      deployment.frameworkConfig = {
        ...deployment.frameworkConfig,
        ...deployment.project.deployConfig
      }
    }

    this.addLog(deployment.deploymentId, `Detected ${deployment.frameworkConfig.name} project`)
  }

  // Install dependencies
  async installDependencies(deployment) {
    await apiService.request('/deployment/install', {
      method: 'POST',
      body: JSON.stringify({
        deploymentId: deployment.deploymentId,
        installCommand: deployment.frameworkConfig.buildCommand
      })
    })

    this.addLog(deployment.deploymentId, 'Dependencies installed successfully')
  }

  // Run tests
  async runTests(deployment) {
    const testResult = await apiService.request('/deployment/test', {
      method: 'POST',
      body: JSON.stringify({
        deploymentId: deployment.deploymentId,
        testCommand: deployment.frameworkConfig.testCommand
      })
    })

    if (!testResult.success) {
      throw new Error(`Tests failed: ${testResult.error}`)
    }

    this.addLog(deployment.deploymentId, `Tests passed (${testResult.testsRun} tests)`)
  }

  // Build application
  async buildApplication(deployment) {
    const buildResult = await apiService.request('/deployment/build', {
      method: 'POST',
      body: JSON.stringify({
        deploymentId: deployment.deploymentId,
        buildCommand: deployment.frameworkConfig.buildCommand,
        outputDir: deployment.frameworkConfig.outputDir
      })
    })

    deployment.metadata.buildArtifacts = buildResult.artifacts
    this.addLog(deployment.deploymentId, 'Application built successfully')
  }

  // Check if containerization is required
  requiresContainerization(deployment) {
    const provider = CLOUD_PROVIDERS[deployment.options.provider]
    return provider.type === 'container'
  }

  // Containerize application
  async containerizeApplication(deployment) {
    const containerResult = await apiService.request('/deployment/containerize', {
      method: 'POST',
      body: JSON.stringify({
        deploymentId: deployment.deploymentId,
        dockerfile: deployment.frameworkConfig.dockerfile,
        port: deployment.frameworkConfig.port
      })
    })

    deployment.metadata.imageTag = containerResult.imageTag
    this.addLog(deployment.deploymentId, `Container built: ${containerResult.imageTag}`)
  }

  // Push to container registry
  async pushToRegistry(deployment) {
    await apiService.request('/deployment/push', {
      method: 'POST',
      body: JSON.stringify({
        deploymentId: deployment.deploymentId,
        imageTag: deployment.metadata.imageTag,
        registry: deployment.options.registry || 'default'
      })
    })

    this.addLog(deployment.deploymentId, 'Container pushed to registry')
  }

  // Deploy to cloud provider
  async deployToProvider(deployment) {
    const deployResult = await apiService.request('/deployment/deploy', {
      method: 'POST',
      body: JSON.stringify({
        deploymentId: deployment.deploymentId,
        provider: deployment.options.provider,
        region: deployment.options.region,
        environment: deployment.options.environment,
        imageTag: deployment.metadata.imageTag,
        config: deployment.frameworkConfig
      })
    })

    deployment.metadata.deploymentUrl = deployResult.url
    deployment.metadata.healthEndpoint = `${deployResult.url}${deployment.frameworkConfig.healthEndpoint}`
    
    this.addLog(deployment.deploymentId, `Deployed to ${deployResult.url}`)
  }

  // Perform health check
  async performHealthCheck(deployment) {
    if (!deployment.metadata.healthEndpoint) {
      this.addLog(deployment.deploymentId, 'No health endpoint configured, skipping health check')
      return
    }

    // Start health monitoring
    healthMonitor.startMonitoring(
      deployment.deploymentId,
      deployment.projectId,
      {
        healthEndpoint: deployment.metadata.healthEndpoint,
        autoRollback: deployment.options.autoRollback
      }
    )

    // Wait for initial health check
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Health check timeout'))
      }, 60000) // 1 minute timeout

      const unsubscribe = healthMonitor.subscribe(deployment.deploymentId, (result) => {
        if (result.status === 'healthy') {
          clearTimeout(timeout)
          unsubscribe()
          resolve()
        } else if (result.status === 'error') {
          clearTimeout(timeout)
          unsubscribe()
          reject(new Error(`Health check failed: ${result.error}`))
        }
      })
    })

    this.addLog(deployment.deploymentId, 'Health check passed')
  }

  // Complete deployment
  async completeDeployment(deploymentId, status) {
    const deployment = this.activeDeployments.get(deploymentId)
    if (!deployment) return

    deployment.status = status
    deployment.endTime = Date.now()
    deployment.duration = deployment.endTime - deployment.startTime

    // Move to history
    this.deploymentHistory.set(deploymentId, deployment)
    this.activeDeployments.delete(deploymentId)

    // Update project status
    await apiService.updateProject(deployment.projectId, {
      status: status === DEPLOYMENT_STAGES.SUCCESS ? 'deployed' : 'failed',
      lastDeployment: deployment.endTime,
      deploymentUrl: deployment.metadata.deploymentUrl
    })

    this.addLog(deploymentId, `Deployment ${status} (${deployment.duration}ms total)`)
    this.notifySubscribers(deploymentId, { status, deployment })
  }

  // Handle deployment errors
  async handleDeploymentError(deploymentId, error) {
    const deployment = this.activeDeployments.get(deploymentId)
    if (!deployment) return

    this.addLog(deploymentId, `Deployment failed: ${error.message}`, 'error')

    // Attempt rollback if enabled
    if (deployment.options.autoRollback) {
      try {
        await this.executeStage(deploymentId, DEPLOYMENT_STAGES.ROLLING_BACK, async () => {
          await this.rollbackDeployment(deployment)
        })
      } catch (rollbackError) {
        this.addLog(deploymentId, `Rollback failed: ${rollbackError.message}`, 'error')
      }
    }

    await this.completeDeployment(deploymentId, DEPLOYMENT_STAGES.FAILED)

    // Handle error through error handler
    errorHandler.handleError(
      new DeploymentError(error.message, deployment.projectId, deploymentId, deployment.currentStage),
      { deployment }
    )
  }

  // Rollback deployment
  async rollbackDeployment(deployment) {
    // Get previous successful deployment
    const previousDeployments = await apiService.getDeployments(deployment.projectId)
    const lastSuccessful = previousDeployments.find(d => 
      d.status === 'success' && d.deploymentId !== deployment.deploymentId
    )

    if (!lastSuccessful) {
      throw new Error('No previous successful deployment found for rollback')
    }

    // Trigger rollback
    await apiService.rollbackDeployment(deployment.projectId, lastSuccessful.deploymentId)
    this.addLog(deployment.deploymentId, `Rolled back to deployment ${lastSuccessful.deploymentId}`)
  }

  // Add log entry
  addLog(deploymentId, message, level = 'info') {
    const deployment = this.activeDeployments.get(deploymentId) || this.deploymentHistory.get(deploymentId)
    if (!deployment) return

    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      stage: deployment.currentStage
    }

    deployment.logs.push(logEntry)
    
    // Keep logs manageable
    if (deployment.logs.length > 1000) {
      deployment.logs = deployment.logs.slice(-1000)
    }
  }

  // Subscribe to deployment updates
  subscribe(deploymentId, callback) {
    if (!this.subscribers.has(deploymentId)) {
      this.subscribers.set(deploymentId, new Set())
    }
    this.subscribers.get(deploymentId).add(callback)

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

  // Notify subscribers
  notifySubscribers(deploymentId, update) {
    const callbacks = this.subscribers.get(deploymentId)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update)
        } catch (error) {
          console.error('Error in deployment pipeline callback:', error)
        }
      })
    }
  }

  // Get deployment status
  getDeploymentStatus(deploymentId) {
    return this.activeDeployments.get(deploymentId) || this.deploymentHistory.get(deploymentId)
  }

  // Cancel deployment
  async cancelDeployment(deploymentId) {
    const deployment = this.activeDeployments.get(deploymentId)
    if (!deployment) throw new Error('Deployment not found or already completed')

    // Cancel the deployment
    await apiService.request(`/deployment/${deploymentId}/cancel`, { method: 'POST' })
    
    this.addLog(deploymentId, 'Deployment cancelled by user')
    await this.completeDeployment(deploymentId, 'cancelled')
  }

  // Get deployment logs
  getDeploymentLogs(deploymentId) {
    const deployment = this.getDeploymentStatus(deploymentId)
    return deployment ? deployment.logs : []
  }

  // Get active deployments
  getActiveDeployments() {
    return Array.from(this.activeDeployments.values())
  }

  // Get deployment history
  getDeploymentHistory(projectId = null, limit = 50) {
    let deployments = Array.from(this.deploymentHistory.values())
    
    if (projectId) {
      deployments = deployments.filter(d => d.projectId === projectId)
    }
    
    return deployments
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit)
  }
}

// Create singleton instance
const deploymentPipeline = new DeploymentPipeline()

export default deploymentPipeline
