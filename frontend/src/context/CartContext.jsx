import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/axios';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
  TOGGLE_DROPDOWN: 'TOGGLE_DROPDOWN'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case CART_ACTIONS.SET_CART:
      return { 
        ...state, 
        items: action.payload, 
        loading: false,
        error: null 
      };
    
    case CART_ACTIONS.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === action.payload.product._id
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity (API already handles this)
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = action.payload;
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { 
          ...state, 
          items: [...state.items, action.payload] 
        };
      }
    
    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload.itemId)
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return { ...state, items: [] };
    
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case CART_ACTIONS.TOGGLE_DROPDOWN:
      return { ...state, showDropdown: action.payload };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
  showDropdown: false
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.role === 'buyer') {
      loadCart();
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated, user]);

  // Calculate totals
  const getCartTotals = () => {
    const subtotal = state.items.reduce((total, item) => 
      total + (item.priceAtTime * item.quantity), 0
    );
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const shipping = itemCount > 0 ? 200 : 0; // Base shipping cost
    const total = subtotal + shipping;

    return { subtotal, itemCount, shipping, total };
  };

  // API functions
  const loadCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.get('/cart');
      dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data.data.items });
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      throw new Error('Only logged-in buyers can add items to cart');
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.post('/cart', {
        productId: product._id,
        quantity
      });
      
      const cartItem = response.data.data;
      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: cartItem });
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: message });
      throw new Error(message);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      await api.patch(`/cart/${itemId}`, { quantity });
      
      dispatch({ 
        type: CART_ACTIONS.UPDATE_QUANTITY, 
        payload: { itemId, quantity } 
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: message });
      throw new Error(message);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      
      dispatch({ 
        type: CART_ACTIONS.REMOVE_ITEM, 
        payload: { itemId } 
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: message });
      throw new Error(message);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: message });
      throw new Error(message);
    }
  };

  const toggleCartDropdown = (show) => {
    dispatch({ type: CART_ACTIONS.TOGGLE_DROPDOWN, payload: show });
  };

  const value = {
    // State
    items: state.items,
    loading: state.loading,
    error: state.error,
    showDropdown: state.showDropdown,
    
    // Computed values
    ...getCartTotals(),
    
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    toggleCartDropdown
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;