import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  LogOut,
  ShoppingBag,
  BarChart3,
  Heart,
  CreditCard,
  Wallet,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';

const BuyerDashNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getBuyerMenuItems = () => [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/my-orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/buyer-dashboard', label: 'Dashboard', icon: BarChart3 },
    { divider: true },
    { to: '/CardManagementPage', label: 'Manage Cards', icon: CreditCard },
    { to: '/payment-history', label: 'Payment History', icon: Wallet }
  ];

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || user.name?.split(' ')[0] || '';
    const lastName = user.lastName || user.name?.split(' ')[1] || '';
    return (firstName[0] + (lastName[0] || '')).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
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

          {/* Right side: User Dropdown */}
          <div className="flex items-center">
            {isAuthenticated && user.role === 'buyer' && (
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
                  {getBuyerMenuItems().map((item, index) => (
                    item.divider ? (
                      <DropdownMenuSeparator key={`divider-${index}`} />
                    ) : (
                      <DropdownMenuItem
                        key={item.to}
                        onClick={() => navigate(item.to)}
                        className="flex items-center cursor-pointer"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    )
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BuyerDashNavbar;