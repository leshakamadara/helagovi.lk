import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProductListing from '../pages/products/ProductListing'
import MainLayout from '../layouts/MainLayout'

const RoleBasedHome = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their role-specific page
      switch (user.role) {
        case 'farmer':
          navigate('/farmer-dashboard')
          break
        case 'buyer':
          // Buyers can stay on marketplace (current page)
          break
        case 'admin':
          navigate('/admin-dashboard')
          break
        default:
          // Default to marketplace for unknown roles
          break
      }
    }
  }, [isAuthenticated, user, navigate])

  // For unauthenticated users or buyers, show the marketplace
  return (
    <MainLayout>
      <ProductListing />
    </MainLayout>
  )
}

export default RoleBasedHome