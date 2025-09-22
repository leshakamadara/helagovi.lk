import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { CheckCircle, XCircle } from 'lucide-react'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification token')
        return
      }

      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`)
        setStatus('success')
        setMessage('Email verified successfully! You can now log in to your account.')
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Failed to verify email')
      }
    }

    verifyEmail()
  }, [token])

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
            <p className="text-gray-600">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-3xl font-extrabold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Go Home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail