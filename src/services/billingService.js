/**
 * Billing and Subscription Management Service
 * Handles Stripe integration and subscription management for DeployGenie
 */

import apiService from './api'
import errorHandler, { ErrorTypes } from '../utils/errorHandler'

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: null,
    features: {
      projects: 3,
      deploymentsPerDay: 5,
      deploymentsPerMonth: 50,
      storage: '1GB',
      support: 'Community',
      customDomains: 0,
      teamMembers: 1,
      buildMinutes: 100,
      bandwidth: '10GB',
      environments: 1,
      rollbacks: 3,
      monitoring: false,
      analytics: false,
      prioritySupport: false,
      sla: false
    },
    limits: {
      projects: 3,
      deploymentsPerDay: 5,
      deploymentsPerMonth: 50,
      storageGB: 1,
      customDomains: 0,
      teamMembers: 1,
      buildMinutes: 100,
      bandwidthGB: 10,
      environments: 1,
      rollbacks: 3
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    stripeId: 'price_pro_monthly',
    features: {
      projects: 25,
      deploymentsPerDay: 50,
      deploymentsPerMonth: 1000,
      storage: '50GB',
      support: 'Email',
      customDomains: 10,
      teamMembers: 5,
      buildMinutes: 2000,
      bandwidth: '500GB',
      environments: 5,
      rollbacks: 'Unlimited',
      monitoring: true,
      analytics: true,
      prioritySupport: false,
      sla: false
    },
    limits: {
      projects: 25,
      deploymentsPerDay: 50,
      deploymentsPerMonth: 1000,
      storageGB: 50,
      customDomains: 10,
      teamMembers: 5,
      buildMinutes: 2000,
      bandwidthGB: 500,
      environments: 5,
      rollbacks: -1 // Unlimited
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    stripeId: 'price_enterprise_monthly',
    features: {
      projects: 'Unlimited',
      deploymentsPerDay: 'Unlimited',
      deploymentsPerMonth: 'Unlimited',
      storage: '500GB',
      support: '24/7 Priority',
      customDomains: 'Unlimited',
      teamMembers: 25,
      buildMinutes: 10000,
      bandwidth: '2TB',
      environments: 'Unlimited',
      rollbacks: 'Unlimited',
      monitoring: true,
      analytics: true,
      prioritySupport: true,
      sla: true
    },
    limits: {
      projects: -1, // Unlimited
      deploymentsPerDay: -1,
      deploymentsPerMonth: -1,
      storageGB: 500,
      customDomains: -1,
      teamMembers: 25,
      buildMinutes: 10000,
      bandwidthGB: 2048,
      environments: -1,
      rollbacks: -1
    }
  }
}

class BillingService {
  constructor() {
    this.stripe = null
    this.currentSubscription = null
    this.usage = null
    this.invoices = []
    this.paymentMethods = []
  }

  // Initialize Stripe
  async initializeStripe() {
    if (typeof window !== 'undefined' && window.Stripe) {
      this.stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    }
    return this.stripe
  }

  // Get current subscription
  async getCurrentSubscription() {
    try {
      const subscription = await apiService.getSubscription()
      this.currentSubscription = subscription
      return subscription
    } catch (error) {
      errorHandler.handleError(error, { action: 'get_subscription' })
      throw error
    }
  }

  // Get subscription plan details
  getPlanDetails(planId) {
    return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free
  }

  // Check if user can perform action based on subscription limits
  canPerformAction(action, currentUsage = {}) {
    if (!this.currentSubscription) return false

    const plan = this.getPlanDetails(this.currentSubscription.planId)
    const limits = plan.limits

    switch (action) {
      case 'create_project':
        return limits.projects === -1 || (currentUsage.projects || 0) < limits.projects

      case 'deploy_today':
        return limits.deploymentsPerDay === -1 || (currentUsage.deploymentsToday || 0) < limits.deploymentsPerDay

      case 'deploy_month':
        return limits.deploymentsPerMonth === -1 || (currentUsage.deploymentsThisMonth || 0) < limits.deploymentsPerMonth

      case 'add_custom_domain':
        return limits.customDomains === -1 || (currentUsage.customDomains || 0) < limits.customDomains

      case 'invite_team_member':
        return limits.teamMembers === -1 || (currentUsage.teamMembers || 0) < limits.teamMembers

      case 'create_environment':
        return limits.environments === -1 || (currentUsage.environments || 0) < limits.environments

      case 'rollback':
        return limits.rollbacks === -1 || (currentUsage.rollbacks || 0) < limits.rollbacks

      case 'use_monitoring':
        return plan.features.monitoring

      case 'use_analytics':
        return plan.features.analytics

      default:
        return true
    }
  }

  // Get usage limits for current plan
  getUsageLimits() {
    if (!this.currentSubscription) return SUBSCRIPTION_PLANS.free.limits

    const plan = this.getPlanDetails(this.currentSubscription.planId)
    return plan.limits
  }

  // Get current usage statistics
  async getCurrentUsage() {
    try {
      const usage = await apiService.getUsageStats()
      this.usage = usage
      return usage
    } catch (error) {
      errorHandler.handleError(error, { action: 'get_usage' })
      throw error
    }
  }

  // Create new subscription
  async createSubscription(planId, paymentMethodId) {
    try {
      if (!this.stripe) {
        await this.initializeStripe()
      }

      const plan = this.getPlanDetails(planId)
      if (!plan.stripeId) {
        throw new Error('Invalid subscription plan')
      }

      const subscription = await apiService.createSubscription(plan.stripeId, paymentMethodId)
      this.currentSubscription = subscription

      return subscription
    } catch (error) {
      const billingError = new Error(`Subscription creation failed: ${error.message}`)
      billingError.type = ErrorTypes.BILLING
      errorHandler.handleError(billingError, { action: 'create_subscription', planId })
      throw billingError
    }
  }

  // Update subscription
  async updateSubscription(newPlanId) {
    try {
      if (!this.currentSubscription) {
        throw new Error('No active subscription found')
      }

      const newPlan = this.getPlanDetails(newPlanId)
      if (!newPlan.stripeId) {
        throw new Error('Invalid subscription plan')
      }

      const updatedSubscription = await apiService.updateSubscription(
        this.currentSubscription.id,
        { planId: newPlan.stripeId }
      )

      this.currentSubscription = updatedSubscription
      return updatedSubscription
    } catch (error) {
      const billingError = new Error(`Subscription update failed: ${error.message}`)
      billingError.type = ErrorTypes.BILLING
      errorHandler.handleError(billingError, { action: 'update_subscription', newPlanId })
      throw billingError
    }
  }

  // Cancel subscription
  async cancelSubscription(cancelAtPeriodEnd = true) {
    try {
      if (!this.currentSubscription) {
        throw new Error('No active subscription found')
      }

      const cancelledSubscription = await apiService.request(
        `/billing/subscription/${this.currentSubscription.id}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ cancelAtPeriodEnd })
        }
      )

      this.currentSubscription = cancelledSubscription
      return cancelledSubscription
    } catch (error) {
      const billingError = new Error(`Subscription cancellation failed: ${error.message}`)
      billingError.type = ErrorTypes.BILLING
      errorHandler.handleError(billingError, { action: 'cancel_subscription' })
      throw billingError
    }
  }

  // Reactivate cancelled subscription
  async reactivateSubscription() {
    try {
      if (!this.currentSubscription) {
        throw new Error('No subscription found')
      }

      const reactivatedSubscription = await apiService.request(
        `/billing/subscription/${this.currentSubscription.id}/reactivate`,
        { method: 'POST' }
      )

      this.currentSubscription = reactivatedSubscription
      return reactivatedSubscription
    } catch (error) {
      const billingError = new Error(`Subscription reactivation failed: ${error.message}`)
      billingError.type = ErrorTypes.BILLING
      errorHandler.handleError(billingError, { action: 'reactivate_subscription' })
      throw billingError
    }
  }

  // Create payment method
  async createPaymentMethod(cardElement) {
    try {
      if (!this.stripe) {
        await this.initializeStripe()
      }

      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Save payment method to backend
      const savedPaymentMethod = await apiService.createPaymentMethod({
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card
      })

      return savedPaymentMethod
    } catch (error) {
      const billingError = new Error(`Payment method creation failed: ${error.message}`)
      billingError.type = ErrorTypes.BILLING
      errorHandler.handleError(billingError, { action: 'create_payment_method' })
      throw billingError
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const paymentMethods = await apiService.request('/billing/payment-methods')
      this.paymentMethods = paymentMethods
      return paymentMethods
    } catch (error) {
      errorHandler.handleError(error, { action: 'get_payment_methods' })
      throw error
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId) {
    try {
      await apiService.request(`/billing/payment-methods/${paymentMethodId}`, {
        method: 'DELETE'
      })

      this.paymentMethods = this.paymentMethods.filter(pm => pm.id !== paymentMethodId)
    } catch (error) {
      const billingError = new Error(`Payment method deletion failed: ${error.message}`)
      billingError.type = ErrorTypes.BILLING
      errorHandler.handleError(billingError, { action: 'delete_payment_method' })
      throw billingError
    }
  }

  // Get invoices
  async getInvoices() {
    try {
      const invoices = await apiService.getInvoices()
      this.invoices = invoices
      return invoices
    } catch (error) {
      errorHandler.handleError(error, { action: 'get_invoices' })
      throw error
    }
  }

  // Download invoice
  async downloadInvoice(invoiceId) {
    try {
      const response = await apiService.request(`/billing/invoices/${invoiceId}/download`, {
        method: 'GET'
      })

      // Create download link
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      errorHandler.handleError(error, { action: 'download_invoice', invoiceId })
      throw error
    }
  }

  // Get billing portal URL
  async getBillingPortalUrl() {
    try {
      const response = await apiService.request('/billing/portal', { method: 'POST' })
      return response.url
    } catch (error) {
      errorHandler.handleError(error, { action: 'get_billing_portal' })
      throw error
    }
  }

  // Calculate prorated amount for plan change
  calculateProration(currentPlan, newPlan, daysRemaining, totalDays) {
    const currentDailyRate = currentPlan.price / totalDays
    const newDailyRate = newPlan.price / totalDays
    
    const currentPlanRefund = currentDailyRate * daysRemaining
    const newPlanCharge = newDailyRate * daysRemaining
    
    return {
      refund: currentPlanRefund,
      charge: newPlanCharge,
      net: newPlanCharge - currentPlanRefund
    }
  }

  // Get upgrade recommendations
  getUpgradeRecommendations(currentUsage) {
    if (!this.currentSubscription) return []

    const currentPlan = this.getPlanDetails(this.currentSubscription.planId)
    const recommendations = []

    // Check if user is hitting limits
    const limits = currentPlan.limits
    const usage = currentUsage || this.usage || {}

    if (limits.projects !== -1 && usage.projects >= limits.projects * 0.8) {
      recommendations.push({
        type: 'projects',
        message: 'You\'re approaching your project limit',
        suggestion: 'Upgrade to increase your project limit'
      })
    }

    if (limits.deploymentsPerMonth !== -1 && usage.deploymentsThisMonth >= limits.deploymentsPerMonth * 0.8) {
      recommendations.push({
        type: 'deployments',
        message: 'You\'re approaching your monthly deployment limit',
        suggestion: 'Upgrade for unlimited deployments'
      })
    }

    if (limits.storageGB !== -1 && usage.storageUsed >= limits.storageGB * 0.8) {
      recommendations.push({
        type: 'storage',
        message: 'You\'re running low on storage',
        suggestion: 'Upgrade for more storage space'
      })
    }

    if (!currentPlan.features.monitoring && usage.projects > 5) {
      recommendations.push({
        type: 'monitoring',
        message: 'Enable monitoring for better deployment insights',
        suggestion: 'Upgrade to Pro for advanced monitoring'
      })
    }

    return recommendations
  }

  // Format price for display
  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price)
  }

  // Get plan comparison data
  getPlanComparison() {
    return Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      ...plan,
      formattedPrice: plan.price === 0 ? 'Free' : this.formatPrice(plan.price),
      isCurrentPlan: this.currentSubscription?.planId === plan.id,
      isUpgrade: this.currentSubscription ? 
        this.getPlanTier(plan.id) > this.getPlanTier(this.currentSubscription.planId) : 
        plan.id !== 'free',
      isDowngrade: this.currentSubscription ? 
        this.getPlanTier(plan.id) < this.getPlanTier(this.currentSubscription.planId) : 
        false
    }))
  }

  // Get plan tier for comparison
  getPlanTier(planId) {
    const tiers = { free: 0, pro: 1, enterprise: 2 }
    return tiers[planId] || 0
  }

  // Check if feature is available
  hasFeature(feature) {
    if (!this.currentSubscription) return SUBSCRIPTION_PLANS.free.features[feature] || false

    const plan = this.getPlanDetails(this.currentSubscription.planId)
    return plan.features[feature] || false
  }

  // Get feature usage percentage
  getFeatureUsage(feature, currentUsage) {
    if (!this.currentSubscription) return 0

    const plan = this.getPlanDetails(this.currentSubscription.planId)
    const limit = plan.limits[feature]
    const usage = currentUsage[feature] || 0

    if (limit === -1) return 0 // Unlimited
    return Math.min((usage / limit) * 100, 100)
  }
}

// Create singleton instance
const billingService = new BillingService()

export default billingService
