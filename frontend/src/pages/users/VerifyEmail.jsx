import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/axios'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')
  const { user, getUserInfo } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification token')
        return
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`)
        setStatus('success')
        setMessage('Email verified successfully! You can now access all features of your account.')

        // If user is logged in, refresh their user data to update verification status
        if (user) {
          try {
            // Small delay to ensure backend has processed the verification
            setTimeout(async () => {
              await getUserInfo()
            }, 1000)
          } catch (refreshError) {
            console.error('Failed to refresh user data:', refreshError)
          }
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage(error.response?.data?.message || 'Failed to verify email')
      }
    }

    verifyEmail()
  }, [token, user, getUserInfo])

  const handleContinue = () => {
    if (user) {
      // If user is logged in, redirect to their dashboard
      if (user.role === 'farmer') {
        navigate('/farmer-dashboard')
      } else if (user.role === 'buyer') {
        navigate('/buyer-dashboard')
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard')
      } else {
        navigate('/')
      }
    } else {
      // If not logged in, redirect to login
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <h2 className="text-3xl font-extrabold text-gray-900">Verifying your email</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-3xl font-extrabold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={handleContinue}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              {user ? 'Continue to Dashboard' : 'Continue to Login'}
            </button>
            {!user && (
              <p className="mt-4 text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-500">Sign in here</Link>
              </p>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-3xl font-extrabold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                Go Home
              </Link>
              <p className="text-sm text-gray-500">
                Need a new verification link? <Link to="/login" className="text-primary-600 hover:text-primary-500">Sign in</Link> and check your profile.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail