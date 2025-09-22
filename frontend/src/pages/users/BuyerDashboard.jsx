import { useAuth } from '../../context/AuthContext'

const BuyerDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Buyer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards for buyers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Browse Products</h3>
            <p className="mt-2 text-sm text-gray-500">Explore agricultural products</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
            <p className="mt-2 text-sm text-gray-500">View your order history</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Favorites</h3>
            <p className="mt-2 text-sm text-gray-500">View your favorite products</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard