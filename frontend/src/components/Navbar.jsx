
import React from 'react';

// SVG Icon for the dropdown arrow
const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 ml-2 text-gray-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// SVG Icon for the search icon
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 ml-2 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  Wallet,
  ChevronDown,
  Star,
  Gift,
  Home
} from 'lucide-react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu'

import { Input } from './ui/input'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Placeholder cart data - replace with actual cart context/state
  const cartCount = 3
  const totalBill = 2500.00

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const handleSearch = () => {
    // Handle search functionality - redirect to marketplace with search query
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/marketplace')
    }
  }



  const navigationItems = [
    { to: '/', label: 'Home' },
    { to: '/organic-products', label: 'Organic Products' },
    { to: '/exclusives', label: 'Exclusives' },
    { to: '/promotions', label: 'All Promotions' }
  ]

  const getBuyerMenuItems = () => [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/my-orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/buyer-dashboard', label: 'Dashboard', icon: BarChart3 }
  ]

  const getFarmerMenuItems = () => [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/farmer-orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/my-products', label: 'My Products', icon: Package },
    { to: '/farmer-dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/farmer/wallet', label: 'Wallet', icon: Wallet },
    { to: '/create-product', label: 'Add Product', icon: Plus }
  ]

  const getDashboardLink = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'farmer': return '/farmer-dashboard'
      case 'buyer': return '/buyer-dashboard'
      case 'admin': return '/admin-dashboard'
      default: return '/'
    }
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const firstName = user.firstName || user.name?.split(' ')[0] || ''
    const lastName = user.lastName || user.name?.split(' ')[1] || ''
    return (firstName[0] + (lastName[0] || '')).toUpperCase()
  }

  // Check if current page should hide search bar (profile pages for buyers, all pages for farmers)
  const isProfileRelatedPage = () => {
    if (!isAuthenticated) return false
    
    // Hide search bar for farmers on all pages
    if (user?.role === 'farmer') return true
    
    // Hide search bar for buyers on profile pages
    if (user?.role === 'buyer') {
      const profileRoutes = ['/profile', '/my-orders', '/favorites', '/buyer-dashboard']
      return profileRoutes.includes(location.pathname)
    }
    
    return false
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Level 1: Logo and Login/Avatar */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Sprout className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-xl font-bold text-gray-800">HeleGovi</span>
              </Link>
            </div>

            {/* Center Navigation Links */}
            {!isProfileRelatedPage() && (
              <div className="hidden md:flex items-center space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-gray-700 hover:text-emerald-600 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side: Cart (for buyers) + Login button or Avatar */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user.role === 'buyer' && !isProfileRelatedPage() && (
                // Cart for logged-in buyers (hide on profile pages)
                <Link 
                  to="/cart"
                  className="flex items-center text-gray-700 hover:text-emerald-600"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="ml-4 text-sm font-medium">
                    Rs. {totalBill.toFixed(2)}
                  </span>
                </Link>
              )}
              
              {isAuthenticated ? (
                // Avatar with dropdown for logged in users (buyers and farmers)
                (user.role === 'buyer' || user.role === 'farmer') ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">
                        {user.firstName || user.name || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48" align="end">
                      {(user.role === 'buyer' ? getBuyerMenuItems() : getFarmerMenuItems()).map((item) => (
                        <DropdownMenuItem key={item.to} asChild>
                          <Link to={item.to} className="flex items-center">
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // For admins, show simple logout button
                  <Button onClick={handleLogout} variant="ghost" size="sm">
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </Button>
                )
              ) : (
                // Guest users see login button
                <Link
                  to="/login"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700"
                >
                  Login
                </Link>
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
                    {/* Mobile Navigation Items */}
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                    
                    <hr className="border-gray-200" />
                    
                    {isAuthenticated ? (
                      (user.role === 'buyer' || user.role === 'farmer') ? (
                        <>
                          <div className="space-y-2">
                            {(user.role === 'buyer' ? getBuyerMenuItems() : getFarmerMenuItems()).map((item) => (
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
                      )
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
      </div>



      {/* Level 3: Search Bar - Hide on profile pages */}
      {!isProfileRelatedPage() && (
        <div className="relative z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-6 py-1">
              <div className="w-full">
                <div className="flex items-center bg-white shadow-lg overflow-hidden h-12 border border-green-500 relative z-50 transform translate-y-3" style={{borderRadius: '0 1.875rem 0 1.875rem'}}>
                  
                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full px-6 py-2 text-base text-gray-700 focus:outline-none"
                  />
                  
                  {/* Search Button */}
                  <button className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-6 h-full transition-colors" style={{borderRadius: '0 0 0 1.875rem'}}>
                    <span className="text-white font-semibold text-base whitespace-nowrap">Search Products</span>
                    <SearchIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </nav>
  )
}

export default Navbar

