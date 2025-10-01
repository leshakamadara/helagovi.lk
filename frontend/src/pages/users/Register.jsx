import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, User, Mail, Phone, Lock, Loader2, UserCheck, ShoppingCart, Shield } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { toast } from 'sonner'

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('farmer')
  const { register: registerUser, loading, error } = useAuth()
  const navigate = useNavigate()

  const roleIcons = {
    farmer: UserCheck,
    buyer: ShoppingCart,
    admin: Shield
  }

  const roleDescriptions = {
    farmer: 'Sell your fresh produce directly to buyers',
    buyer: 'Buy fresh produce directly from farmers',
    admin: 'Manage platform operations and users'
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    const result = await registerUser({ ...data, role: selectedRole })
    if (result.success) {
      toast.success('Account created successfully! Please login.')
      navigate('/login')
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Join HelaGovi - Connect farmers and buyers
        </p>
      </div>
      <div className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Role Selection */}
        <div className="grid gap-2">
          <Label className="text-sm font-medium">I am a</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(roleIcons).map(([role, Icon]) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedRole === role
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-medium capitalize">{role}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {roleDescriptions[selectedRole]}
          </p>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
              className={errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 font-medium">{errors.firstName.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...register('lastName', { required: 'Last name is required' })}
              className={errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 font-medium">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="john@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^(\+94|0)[0-9]{9}$/,
                  message: 'Invalid phone number format',
                },
              })}
              className={`pl-10 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="+94 77 123 4567"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
            className={errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white font-medium py-2"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="underline underline-offset-4 hover:text-[#079669]">
          Sign in here
        </Link>
      </div>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759263222/banner_gypb09.png"
          alt="Helagovi.lk Banner"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 md:gap-12">
          <div
            className="font-black tracking-[-4%] text-transparent bg-clip-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-center pb-2"
            style={{
              background: 'radial-gradient(circle, #34E89E 0%, #45A21A 50%, #005B26 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Share Your Harvest
          </div>
          <img
            src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
            alt="Helagovi.lk Logo"
            className="w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-green-50">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center">
            <img
              src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png"
              alt="Helagovi.lk Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="ml-2 text-xl font-bold text-gray-800">Helagovi.lk</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}