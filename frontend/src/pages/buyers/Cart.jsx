import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Leaf,
  Star,
  CreditCard
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'

const Cart = () => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/cart', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      // Initialize with empty cart - will be populated when cart API is implemented
      setCartItems([])
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    try {
      setUpdating(true)
      
      // TODO: Replace with actual API call
      // await fetch(`/api/cart/${itemId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ quantity: newQuantity })
      // })
      
      setCartItems(prev => prev.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    } catch (error) {
      alert('Failed to update quantity')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Remove this item from cart?')) return
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/cart/${itemId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      setCartItems(prev => prev.filter(item => item._id !== itemId))
      alert('Item removed from cart')
    } catch (error) {
      alert('Failed to remove item')
    }
  }

  const handleCheckout = () => {
    // TODO: Implement checkout process
    alert('Checkout feature coming soon!')
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const calculateShipping = () => {
    // Shipping calculation - can be enhanced with real shipping logic
    return cartItems.length > 0 ? 200 : 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <H1 className="text-gray-900">Shopping Cart</H1>
        <P className="text-gray-600">Review your items and proceed to checkout</P>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item._id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.primaryImage?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                      alt={item.product.title}
                      className="h-20 w-20 rounded-lg object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/80x80?text=Product'}
                    />
                    
                    <div className="flex-1">
                      <H3 className="text-gray-900">{item.product.title}</H3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{item.product.city}, {item.product.district}</span>
                        <span>•</span>
                        <span>by {item.product.farmer.firstName} {item.product.farmer.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {item.product.isOrganic && <Leaf className="h-4 w-4 text-green-600" />}
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600 ml-1">{item.product.qualityScore}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Added {formatDate(item.addedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(item.product.price)}/{item.product.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Available: {item.product.availableQuantity}
                        </div>
                      </div>

                      <div className="flex items-center border border-gray-300 rounded-md">
                        <Button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          disabled={updating || item.quantity >= item.product.availableQuantity}
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                        <Button
                          onClick={() => handleRemoveItem(item._id)}
                          variant="destructive"
                          size="sm"
                          className="mt-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <H3 className="text-gray-900 mb-4">Order Summary</H3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatCurrency(calculateShipping())}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <Large className="text-gray-900">Total</Large>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Order Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All prices include taxes</li>
                  <li>• Shipping calculated at checkout</li>
                  <li>• Fresh products directly from farmers</li>
                  <li>• Quality guaranteed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <H3 className="text-gray-900">Your cart is empty</H3>
          <P className="text-gray-500">
            Add some fresh products to your cart and come back here to checkout.
          </P>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Start Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart