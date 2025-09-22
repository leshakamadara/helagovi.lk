import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Heart,
  MapPin,
  Star,
  ShoppingCart,
  Trash2,
  Leaf,
  Eye
} from 'lucide-react'

const Favorites = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/favorites', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      // Mock data for now
      const mockFavorites = [
        {
          _id: '1',
          title: 'Fresh Organic Tomatoes',
          description: 'Premium quality organic tomatoes grown without pesticides',
          price: 450,
          unit: 'kg',
          district: 'Kandy',
          city: 'Peradeniya',
          availableQuantity: 65,
          initialQuantity: 100,
          isOrganic: true,
          qualityScore: 5,
          status: 'active',
          farmer: {
            firstName: 'Sunil',
            lastName: 'Perera'
          },
          primaryImage: {
            url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          },
          createdAt: '2024-01-20T00:00:00.000Z'
        },
        {
          _id: '2',
          title: 'Fresh Carrots',
          description: 'Sweet and crunchy carrots perfect for cooking and salads',
          price: 350,
          unit: 'kg',
          district: 'Colombo',
          city: 'Negombo',
          availableQuantity: 40,
          initialQuantity: 80,
          isOrganic: false,
          qualityScore: 4,
          status: 'active',
          farmer: {
            firstName: 'Jane',
            lastName: 'Smith'
          },
          primaryImage: {
            url: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          },
          createdAt: '2024-01-18T00:00:00.000Z'
        },
        {
          _id: '3',
          title: 'Organic Lettuce',
          description: 'Fresh crispy lettuce perfect for salads',
          price: 400,
          unit: 'bunch',
          district: 'Galle',
          city: 'Galle',
          availableQuantity: 25,
          initialQuantity: 50,
          isOrganic: true,
          qualityScore: 5,
          status: 'active',
          farmer: {
            firstName: 'Mike',
            lastName: 'Johnson'
          },
          primaryImage: {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          },
          createdAt: '2024-01-21T00:00:00.000Z'
        }
      ]
      
      setFavorites(mockFavorites)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (productId) => {
    if (!window.confirm('Remove this product from favorites?')) return
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/favorites/${productId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      setFavorites(prev => prev.filter(item => item._id !== productId))
      alert('Removed from favorites')
    } catch (error) {
      alert('Failed to remove from favorites')
    }
  }

  const handleAddToCart = async (product) => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/cart/add', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     productId: product._id,
      //     quantity: 1
      //   })
      // })
      
      alert('Added to cart successfully!')
    } catch (error) {
      alert('Failed to add to cart')
    }
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        <p className="mt-2 text-gray-600">Your saved products</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.primaryImage?.url || 'https://via.placeholder.com/300x200?text=Product'}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Product'}
                />
                <button
                  onClick={() => handleRemoveFavorite(product._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart className="h-5 w-5 text-red-600 fill-current" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.title}</h3>
                  <div className="flex items-center space-x-1">
                    {product.isOrganic && <Leaf className="h-4 w-4 text-green-600" />}
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 ml-1">{product.qualityScore}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(product.price)}/{product.unit}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.availableQuantity}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{product.city}, {product.district}</span>
                  <span>•</span>
                  <span>by {product.farmer.firstName} {product.farmer.lastName}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/product-details?id=${product._id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 flex items-center justify-center text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm font-medium"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Added {formatDate(product.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start browsing products and add them to your favorites.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Heart className="h-4 w-4 mr-2" />
              Browse Products
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Favorites