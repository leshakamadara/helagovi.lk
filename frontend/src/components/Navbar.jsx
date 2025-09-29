
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

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
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
  Home,
  MapPin,
  Leaf,
  Trash2,
  CreditCard
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
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import api from '../lib/axios'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { isAuthenticated, user, logout } = useAuth()
  const { items: cartItems, itemCount, total, removeFromCart, showDropdown, toggleCartDropdown } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)
  const cartRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  // Search functionality
  const searchProducts = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setShowSuggestions(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await api.get(`/products?search=${encodeURIComponent(query)}&limit=8`)
      const products = response.data.data || []
      setSearchResults(products)
      setShowSuggestions(products.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setShowSuggestions(false)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchProducts(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(-1)
  }

  const handleProductSelect = (product) => {
    setSearchQuery('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    navigate(`/product-details?id=${product._id}`)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      handleProductSelect(searchResults[selectedIndex])
      return
    }

    if (searchQuery.trim()) {
      setShowSuggestions(false)
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/products')
    }
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        searchRef.current?.blur()
        break
      case 'Enter':
        e.preventDefault()
        handleSearchSubmit(e)
        break
    }
  }

  // Close suggestions and cart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search suggestions
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
      
      // Close cart dropdown
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        toggleCartDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [toggleCartDropdown])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeFromCart(itemId)
      // Import toast dynamically to avoid import issues
      import('sonner').then(({ toast }) => {
        toast.success('Item removed from cart')
      })
    } catch (error) {
      console.error('Error removing item from cart:', error)
      import('sonner').then(({ toast }) => {
        toast.error('Failed to remove item', {
          description: error.message || 'Something went wrong'
        })
      })
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
    { to: '/buyer-dashboard', label: 'Dashboard', icon: BarChart3 },
    { divider: true },
    { to: '/CardManagementPage', label: 'Manage Cards', icon: CreditCard },
    { to: '/payment-history', label: 'Payment History', icon: Wallet }
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
      const profileRoutes = ['/profile', '/my-orders', '/favorites', '/buyer-dashboard','/CardManagementPage','/payment-history']
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
                <img 
                  src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png" 
                  alt="Helagovi.lk Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="ml-2 text-xl font-bold text-gray-800">Helagovi.lk</span>
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
                <div className="relative" ref={cartRef}>
                  <button
                    onClick={() => toggleCartDropdown(!showDropdown)}
                    className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </div>
                    <span className="ml-4 text-sm font-medium">
                      Rs. {total.toFixed(2)}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>

                  {/* Cart Dropdown */}
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Shopping Cart</h3>
                          <span className="text-sm text-gray-500">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        {cartItems.length > 0 ? (
                          <>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {cartItems.map((item) => (
                                <div key={item._id} className="flex items-center space-x-3">
                                  <img
                                    src={item.product.images?.[0]?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                                    alt={item.product.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">
                                      {item.product.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {item.quantity} × Rs. {item.product.price}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">
                                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                                    </span>
                                    <Button
                                      onClick={() => handleRemoveFromCart(item._id)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-emerald-600">
                                  Rs. {total.toFixed(2)}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <Button
                                  onClick={() => {
                                    toggleCartDropdown(false)
                                    navigate('/cart')
                                  }}
                                  variant="outline"
                                  className="w-full"
                                  size="sm"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  View Cart
                                </Button>
                                <Button
                                  onClick={() => {
                                    toggleCartDropdown(false)
                                    navigate('/checkout/delivery')
                                  }}
                                  className="w-full"
                                  size="sm"
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Checkout
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 mb-3">Your cart is empty</p>
                            <Button
                              onClick={() => {
                                toggleCartDropdown(false)
                                navigate('/products')
                              }}
                              size="sm"
                            >
                              Start Shopping
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
                      {(user.role === 'buyer' ? getBuyerMenuItems() : getFarmerMenuItems()).map((item, index) => (
                        item.divider ? (
                          <DropdownMenuSeparator key={`divider-${index}`} />
                        ) : (
                          <DropdownMenuItem key={item.to} asChild>
                            <Link to={item.to} className="flex items-center">
                              <item.icon className="h-4 w-4 mr-2" />
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        )
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
                <SheetContent side="right" className="w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <img 
                        src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png" 
                        alt="Helagovi.lk Logo" 
                        className="h-6 w-6 object-contain"
                      />
                      Helagovi.lk
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {/* Cart for buyers on mobile */}
                    {isAuthenticated && user.role === 'buyer' && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 mb-2">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-emerald-600" />
                          <span className="font-medium">Cart</span>
                          {itemCount > 0 && (
                            <span className="ml-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {itemCount}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => {
                            setIsOpen(false)
                            navigate('/cart')
                          }}
                        >
                          View
                        </Button>
                      </div>
                    )}
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
                    {/* Buyer options directly in navigation for mobile */}
                    {isAuthenticated && user.role === 'buyer' && (
                      <div className="space-y-2">
                        {/* Profile section */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-700">
                            {user.firstName || user.name || 'User'}
                          </span>
                        </div>
                        {/* Buyer menu items */}
                        {getBuyerMenuItems().map((item, index) => (
                          item.divider ? (
                            <hr key={`divider-${index}`} className="border-gray-200 my-2" />
                          ) : (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              <item.icon className="h-5 w-5 text-emerald-600" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          )
                        ))}
                        <Button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          variant="outline"
                          className="w-full justify-start gap-3 mt-2"
                        >
                          <LogOut className="h-5 w-5" />
                          Logout
                        </Button>
                      </div>
                    )}
                    {/* Farmer mobile menu (unchanged) */}
                    {isAuthenticated && user.role === 'farmer' && (
                      <div className="space-y-2">
                        {getFarmerMenuItems().map((item) => (
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
                    )}
                    {/* Guest users */}
                    {!isAuthenticated && (
                      <div className="space-y-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-center border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to="/login">
                            Login
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to="/register">
                            Register
                          </Link>
                        </Button>
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
              <div className="w-full relative">
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center bg-white shadow-lg overflow-hidden h-12 border border-green-500 relative z-50 transform translate-y-3" style={{borderRadius: '0 1.875rem 0 1.875rem'}}>
                    
                    {/* Search Input */}
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => searchQuery.length >= 2 && setShowSuggestions(searchResults.length > 0)}
                      placeholder="Search for products..."
                      className="w-full px-6 py-2 text-base text-gray-700 focus:outline-none"
                      autoComplete="off"
                    />
                    
                    {/* Loading indicator */}
                    {isSearching && (
                      <div className="px-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                      </div>
                    )}
                    
                    {/* Search Button */}
                    <button 
                      type="submit"
                      className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-6 h-full transition-colors" 
                      style={{borderRadius: '0 0 0 1.875rem'}}
                    >
                      <span className="text-white font-semibold text-base whitespace-nowrap">Search Products</span>
                      <SearchIcon />
                    </button>
                  </div>
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchResults.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-lg mt-1 max-h-96 overflow-y-auto z-50 mx-2 sm:mx-0"
                    style={{ transform: 'translateY(3px)' }}
                  >
                    <div className="py-2">
                      {searchResults.map((product, index) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductSelect(product)}
                          className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedIndex === index 
                              ? 'bg-green-50 border-l-4 border-l-green-500' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={product.images?.[0]?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                                alt={product.title}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'
                                }}
                              />
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {product.title}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm font-semibold text-green-600">
                                      {formatPrice(product.price)}/{product.unit}
                                    </span>
                                    {product.isOrganic && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1 py-0">
                                        <Leaf className="w-3 h-3 mr-1" />
                                        Organic
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span>{product.city}, {product.district}</span>
                                    {product.farmer && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span>
                                          {product.farmer.firstName && product.farmer.lastName 
                                            ? `${product.farmer.firstName} ${product.farmer.lastName}`
                                            : product.farmer.firstName || product.farmer.lastName || 'Farmer'
                                          }
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Availability */}
                                <div className="flex-shrink-0 ml-2">
                                  <Badge 
                                    variant={product.status === 'active' && product.availableQuantity > 0 ? "default" : "destructive"} 
                                    className="text-xs"
                                  >
                                    {product.status === 'active' && product.availableQuantity > 0 ? 'Available' : 'Sold Out'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* View All Results Link */}
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={() => {
                            setShowSuggestions(false)
                            navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
                          }}
                          className="w-full text-left text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          View all results for "{searchQuery}" →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </nav>
  )
}

export default Navbar

