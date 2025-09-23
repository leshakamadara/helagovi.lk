
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Sprout className="h-6 w-6 text-emerald-600" />
                    HeleGovi
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div className="space-y-2">
                        {getRoleSpecificMenuItems().map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-5 w-5 text-emerald-600" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                      
                      <hr className="border-gray-200" />
                      
                      <div className="space-y-2">
                        <Link
                          to={getDashboardLink()}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <BarChart3 className="h-5 w-5 text-emerald-600" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-5 w-5 text-emerald-600" />
                          <span className="font-medium">Profile</span>
                        </Link>
                      </div>
                      
                      <hr className="border-gray-200" />
                      
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        variant="outline"
                        className="w-full justify-start gap-3"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        className="block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="font-medium">Login</span>
                      </Link>
                      <Link
                        to="/register"
                        className="block px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="font-medium">Register</span>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

