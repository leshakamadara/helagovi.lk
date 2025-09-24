import { Link } from 'react-router-dom'
import { useAuth } from "../../context/AuthContext";
import { Sprout, ShoppingCart, Users, ArrowRight } from 'lucide-react'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'farmer': return '/farmer-dashboard'
      case 'buyer': return '/buyer-dashboard'
      case 'admin': return '/admin-dashboard'
      default: return '/'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <H1 className="text-white mb-6">
              Welcome to HeleGovi
            </H1>
            <Large className="text-white mb-8 max-w-3xl mx-auto">
              Connecting farmers and buyers in a seamless online marketplace for agricultural products
            </Large>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <H2 className="text-center text-gray-900 mb-12">
            Why Choose HeleGovi?
          </H2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-primary-600" />
              </div>
              <H3 className="mb-2">For Farmers</H3>
              <P className="text-gray-600">
                Reach more buyers, showcase your products, and grow your business with our platform.
              </P>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-primary-600" />
              </div>
              <H3 className="mb-2">For Buyers</H3>
              <P className="text-gray-600">
                Discover fresh agricultural products directly from farmers at competitive prices.
              </P>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <H3 className="mb-2">Community</H3>
              <P className="text-gray-600">
                Join a growing community of farmers and buyers supporting local agriculture.
              </P>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <H2 className="text-gray-900 mb-6">
            Ready to get started?
          </H2>
          <Large className="text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of farmers and buyers who are already using HeleGovi to transform agricultural trade.
          </Large>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Create Your Account
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home