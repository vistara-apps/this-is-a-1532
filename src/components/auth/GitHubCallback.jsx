import React, { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const GitHubCallback = () => {
  const { handleGitHubCallback } = useAuth()

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        if (error) {
          toast.error(`GitHub authentication failed: ${error}`)
          window.close()
          return
        }

        if (!code) {
          toast.error('No authorization code received from GitHub')
          window.close()
          return
        }

        await handleGitHubCallback(code, state)
        toast.success('GitHub connected successfully!')
        
        // Close popup window or redirect
        if (window.opener) {
          window.close()
        } else {
          window.location.href = '/dashboard'
        }
      } catch (error) {
        toast.error('Failed to connect GitHub account')
        if (window.opener) {
          window.close()
        } else {
          window.location.href = '/login'
        }
      }
    }

    processCallback()
  }, [handleGitHubCallback])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-dark-300">Connecting your GitHub account...</p>
      </div>
    </div>
  )
}

export default GitHubCallback
