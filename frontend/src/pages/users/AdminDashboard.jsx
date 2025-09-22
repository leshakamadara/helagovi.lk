import { useAuth } from '../../context/AuthContext'

const AdminDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards for admins */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <p className="mt-2 text-sm text-gray-500">Manage platform users</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
            <p className="mt-2 text-sm text-gray-500">View platform analytics</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            <p className="mt-2 text-sm text-gray-500">Configure platform settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard