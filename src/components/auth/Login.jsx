import React, { useState } from 'react'
import { Github, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import toast from 'react-hot-toast'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  
  const { login, register, connectGitHub } = useAuth()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        })
        toast.success('Welcome back to DeployGenie!')
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return
        }
        
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
        toast.success('Account created successfully!')
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    try {
      setLoading(true)
      await connectGitHub()
    } catch (error) {
      toast.error('GitHub authentication failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-xl mb-4">
            <span className="text-2xl font-bold text-white">DG</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DeployGenie</h1>
          <p className="text-dark-300">Effortless App Deployment for Developers</p>
        </div>

        <Card className="border-dark-700 bg-dark-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-dark-300">
              {isLogin 
                ? 'Sign in to your DeployGenie account' 
                : 'Get started with DeployGenie today'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* GitHub OAuth Button */}
            <Button
              onClick={handleGitHubLogin}
              disabled={loading}
              variant="outline"
              className="w-full border-dark-600 hover:border-primary-500 hover:bg-primary-500/10"
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-800 text-dark-400">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Enter your full name"
                />
              )}

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {!isLogin && (
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Confirm your password"
                />
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Toggle between login/register */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>

            {/* Forgot password link (only show on login) */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-dark-400 hover:text-dark-200 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-dark-400">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
