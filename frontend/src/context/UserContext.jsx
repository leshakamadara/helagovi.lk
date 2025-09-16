import { createContext, useContext, useState } from 'react';

// UserContext for global user state
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Mock user data for now
  const [user, setUser] = useState({
    userId: 'mock-user-id',
    name: 'Demo User',
    email: 'demo@user.com',
    role: 'farmer', // 'farmer', 'buyer', 'support', 'admin'
    isAuthenticated: true
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
