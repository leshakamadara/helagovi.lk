import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Phone, Camera, Trash2, Save, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../../lib/axios'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'

const Profile = () => {
  const [editMode, setEditMode] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const { user, updateProfile, uploadProfilePicture, removeProfilePicture, deactivateAccount, deleteAccount } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  })

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleCancel = () => {
    reset()
    setEditMode(false)
  }

  const onSubmit = async (data) => {
    const result = await updateProfile(data)
    if (result.success) {
      setEditMode(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      await uploadProfilePicture(file)
    }
  }

  const handleRemoveImage = async () => {
    await removeProfilePicture()
  }

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate your account?')) {
      await deactivateAccount()
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await deleteAccount()
    }
  }

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      const response = await api.post('/auth/resend-verification');
      toast.success(response.data.message || 'Verification email sent successfully!');
    } catch (error) {
      console.error('Failed to resend verification:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setResendingVerification(false);
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={user?.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="px-6 py-8 bg-gradient-to-r from-primary to-primary text-white">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {user.profilePicture ? (
                  <AvatarImage src={`http://localhost:5001/${user.profilePicture}`} alt="Profile" />
                ) : null}
                <AvatarFallback className="text-gray-500 font-semibold text-4xl">
                  {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <>
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer shadow-md"
                  >
                    <Camera className="h-4 w-4 text-primary" />
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {user.profilePicture && (
                    <Button
                      onClick={handleRemoveImage}
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 rounded-full p-2 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
            <div>
              <H2 className="text-white border-0">
                {user.firstName} {user.lastName}
              </H2>
              <div className="text-white/80 capitalize text-sm mb-2">{user.role}</div>
              <div className="text-white/80 text-sm">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="px-6 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  First Name
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 text-gray-900"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Last Name
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  type="text"
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 text-gray-900"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email Address
              </label>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Phone Number
              </label>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number',
                    },
                  })}
                  type="tel"
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 text-gray-900"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              {editMode ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>

          {/* Account Actions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <H2 className="mb-4 text-gray-900">Account Actions</H2>
            
            {/* Email Verification Section */}
            <div className="mb-6">
              <H3 className="mb-3 text-gray-700">Email Verification</H3>
              {user.isVerified ? (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <div>
                    <P className="font-medium text-green-800">Email Verified</P>
                    <Muted className="text-green-700">Your email address has been verified</Muted>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertCircle className="h-5 w-5 text-amber-400 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <P className="font-medium text-amber-800">Email Not Verified</P>
                      <Muted className="text-amber-700 mt-1">
                        Please verify your email address to access all features and create products.
                      </Muted>
                    </div>
                  </div>
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    variant="secondary"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </div>
              )}
            </div>

            {/* Existing Account Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleDeactivate}
                variant="secondary"
              >
                Deactivate Account
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="ml-4"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile