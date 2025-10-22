import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true 
      }
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false }
    case 'UPDATE_USER':
      return { ...state, user: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true, // Start with loading true to check authentication on app init
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set axios defaults
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
      localStorage.setItem('token', state.token)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [state.token])

  // Check if token exists on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user info
      getUserInfo()
    } else {
      // No token, set loading to false
      dispatch({ type: 'LOGIN_FAILURE', payload: null })
    }
  }, [])

  const getUserInfo = async () => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await api.get('/auth/me')
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data.user,
          token: state.token
        }
      })
    } catch (error) {
      console.error('Failed to get user info:', error)
      logout()
    }
  }

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await api.post('/auth/login', { email, password })
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data.data
      })
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      toast.success('Registration successful! Please check your email for verification.')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/profile', userData)
      dispatch({ type: 'UPDATE_USER', payload: response.data.data.user })
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const uploadProfilePicture = async (file) => {
    try {
      const formData = new FormData()
      formData.append('profilePicture', file)
      
      const response = await api.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      dispatch({ type: 'UPDATE_USER', payload: response.data.data.user })
      toast.success('Profile picture updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload profile picture'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const removeProfilePicture = async () => {
    try {
      const response = await api.delete('/profile/remove-picture')
      dispatch({ type: 'UPDATE_USER', payload: response.data.data.user })
      toast.success('Profile picture removed successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove profile picture'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const deactivateAccount = async () => {
    try {
      await api.put('/profile/deactivate')
      logout()
      toast.success('Account deactivated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deactivate account'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const deleteAccount = async () => {
    try {
      await api.delete('/profile')
      logout()
      toast.success('Account deleted successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete account'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Password reset instructions sent to your email')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset instructions'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password reset successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateProfile,
      uploadProfilePicture,
      removeProfilePicture,
      deactivateAccount,
      deleteAccount,
      forgotPassword,
      resetPassword,
      clearError,
      getUserInfo
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}