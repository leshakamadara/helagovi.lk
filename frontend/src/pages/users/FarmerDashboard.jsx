import { useAuth } from '../../context/AuthContext'

const FarmerDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Farmer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards for farmers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">My Products</h3>
            <p className="mt-2 text-sm text-gray-500">Manage your agricultural products</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Orders</h3>
            <p className="mt-2 text-sm text-gray-500">View and manage your orders</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
            <p className="mt-2 text-sm text-gray-500">View your sales analytics</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboard