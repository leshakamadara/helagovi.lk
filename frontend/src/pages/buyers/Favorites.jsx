import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

const Favorites = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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
            url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
            url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/buyer-dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Favorites</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <H1 className="text-gray-900">My Favorites</H1>
        <P className="text-gray-600">Your saved products</P>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.primaryImage?.url || 'https://via.placeholder.com/300x200?text=Product'}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Product'}
                />
                <Button
                  onClick={() => handleRemoveFavorite(product._id)}
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 bg-white hover:bg-red-50 border-0"
                >
                  <Heart className="h-4 w-4 text-red-600 fill-current" />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.title}</h3>
                  <div className="flex items-center space-x-1">
                    {product.isOrganic && <Leaf className="h-4 w-4 text-green-600" />}
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
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
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/product-details?id=${product._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>

                <div className="mt-2 text-xs text-gray-500 text-center">
                  Added {formatDate(product.createdAt)}
                </div>
              </CardContent>
            </Card>
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
            <Button asChild>
              <Link to="/">
                <Heart className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Favorites