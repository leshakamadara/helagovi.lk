import React from 'react';
import { useAuth } from '../context/AuthContext';

const Debug = () => {
  const { isAuthenticated, user, loading, token } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Auth State:</h2>
        <div className="space-y-2">
          <p><strong>Loading:</strong> {loading.toString()}</p>
          <p><strong>Authenticated:</strong> {isAuthenticated.toString()}</p>
          <p><strong>Token exists:</strong> {!!localStorage.getItem('token')}</p>
          <p><strong>Token:</strong> {localStorage.getItem('token')?.substring(0, 50)}...</p>
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => {
              localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTJlNWNkMzNjMGVkMzY2YTE5MmNjNCIsImVtYWlsIjoidGVzdGZhcm1lckBleGFtcGxlLmNvbSIsInJvbGUiOiJmYXJtZXIiLCJpYXQiOjE3MjcxMTU5NzMsImV4cCI6MTcyOTcwNzk3M30.OKoMkWXoMGc6cA2CqQFJ9M9gN6pF1sLpfWkK5qzHCsU');
              window.location.reload();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Set Test Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default Debug;