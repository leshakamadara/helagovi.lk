import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format a date into "January 15, 2024"
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Status color mapping
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Format numbers as currency (Rs.)
export const formatCurrency = (amount) => {
  return `Rs. ${amount.toLocaleString()}`;
};


// Freshness color by days
export const getFreshnessColor = (days) => {
  if (days <= 5) return 'text-green-600';
  if (days <= 7) return 'text-yellow-600';
  return 'text-red-600';
};