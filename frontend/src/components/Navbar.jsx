
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Menu,
  X,
  User,
  LogOut,
  ShoppingCart,
  Sprout,
  Settings,
  Package,
  Plus,
  BarChart3,
  Heart,
  Search,
  ShoppingBag,
  Wallet
} from 'lucide-react'
import { Button } from './ui/button'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const getRoleSpecificMenuItems = () => {
    if (!user) return []
    
    switch (user.role) {
      case 'farmer':
        return [
          { to: '/my-products', label: 'My Products', icon: Package },
          { to: '/create-product', label: 'Add Product', icon: Plus },
          { to: '/farmer-orders', label: 'Orders', icon: ShoppingBag },
          { to: '/farmer/wallet', label: 'Wallet', icon: Wallet },
          { to: '/farmer-analytics', label: 'Analytics', icon: BarChart3 },
        ]
      case 'buyer':
        return [
          { to: '/marketplace', label: 'Browse Products', icon: Search },
          { to: '/my-orders', label: 'My Orders', icon: ShoppingBag },
          { to: '/favorites', label: 'Favorites', icon: Heart },
          { to: '/cart', label: 'Cart', icon: ShoppingCart },
        ]
      case 'admin':
        return [
          { to: '/admin-products', label: 'All Products', icon: Package },
          { to: '/admin-users', label: 'Users', icon: User },
          { to: '/admin-orders', label: 'Orders', icon: ShoppingBag },
          { to: '/admin-analytics', label: 'Analytics', icon: BarChart3 },
        ]
      default:
        return []
    }
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'farmer': return '/farmer-dashboard'
      case 'buyer': return '/buyer-dashboard'
      case 'admin': return '/admin-dashboard'
      default: return '/'
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Sprout className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">HeleGovi</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {getRoleSpecificMenuItems().map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Link>
                ))}
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  <User className="h-5 w-5 inline mr-1" />
                  Profile
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="sm"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {isAuthenticated ? (
              <>
                {getRoleSpecificMenuItems().map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-gray-700 hover:text-primary-600 flex items-center px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </Link>
                ))}
                <hr className="my-2 border-gray-200" />
                <Link
                  to={getDashboardLink()}
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="justify-start w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white block px-3 py-2 rounded-md text-base font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

