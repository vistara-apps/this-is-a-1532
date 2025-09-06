import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // In production, you would send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: Send to Sentry, LogRocket, etc.
      console.error('Production error:', error)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-red-500/20 bg-dark-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <CardTitle className="text-xl text-white">Something went wrong</CardTitle>
              <CardDescription className="text-dark-300">
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-dark-900 border border-dark-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-400 mb-2">Error Details (Development)</h4>
                  <pre className="text-xs text-dark-300 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-dark-400">
                  If this problem persists, please{' '}
                  <a 
                    href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@deploygenie.com'}`}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    contact support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
