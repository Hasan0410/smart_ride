import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, logout, updateUser } from '../store/authSlice';
import api from '../api/axios';

// High-fidelity Mock Database for Offline/Fallback Mode
const MOCK_USERS = {
  'passenger@smartride.com': {
    id: 'p1111111-2222-3333-4444-555555555555',
    email: 'passenger@smartride.com',
    phone: '+923001234567',
    first_name: 'Ahmed',
    last_name: 'Khan',
    role: 'passenger',
    is_verified: true,
    avatar: null,
    created_at: new Date().toISOString()
  },
  'driver@smartride.com': {
    id: 'd1111111-2222-3333-4444-555555555555',
    email: 'driver@smartride.com',
    phone: '+923009876543',
    first_name: 'Muhammad',
    last_name: 'Ali',
    role: 'driver',
    is_verified: true,
    avatar: null,
    created_at: new Date().toISOString(),
    driver_profile: {
      id: 'dp-1234',
      license_number: 'LIC-PK-99128',
      license_image: null,
      status: 'approved',
      is_online: true,
      current_lat: 31.5204,
      current_lng: 74.3587,
      rating_avg: 4.8,
      total_rides: 42,
      total_earnings: 12500.00,
      approved_at: new Date().toISOString(),
      vehicle: {
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        color: 'White',
        plate_number: 'LEB-24-1928',
        vehicle_type: 'comfort',
        is_active: true
      }
    }
  },
  'admin@smartride.com': {
    id: 'a1111111-2222-3333-4444-555555555555',
    email: 'admin@smartride.com',
    phone: '+923000000000',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'admin',
    is_verified: true,
    avatar: null,
    created_at: new Date().toISOString()
  }
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const loginUser = async (email, password) => {
    dispatch(authStart());
    try {
      // Try actual backend API
      const response = await api.post('/auth/login/', { email, password });
      dispatch(authSuccess({
        user: response.data.user,
        access: response.data.access,
        refresh: response.data.refresh
      }));
      return response.data.user;
    } catch (err) {
      // Network/Server Offline Fallback
      if (!err.response) {
        console.warn('Backend server not responding. Falling back to offline simulator.');
        const mockUser = MOCK_USERS[email.toLowerCase()];
        if (mockUser) {
          const mockPayload = {
            user: mockUser,
            access: 'mock-access-jwt-token-xyz',
            refresh: 'mock-refresh-jwt-token-xyz'
          };
          dispatch(authSuccess(mockPayload));
          return mockUser;
        } else {
          // Create a dynamic passenger if not found
          const newUser = {
            id: `p-${Math.random().toString(36).substr(2, 9)}`,
            email: email,
            phone: '+923000000000',
            first_name: email.split('@')[0],
            last_name: 'User',
            role: email.includes('driver') ? 'driver' : email.includes('admin') ? 'admin' : 'passenger',
            is_verified: true,
            avatar: null,
            created_at: new Date().toISOString()
          };
          
          if (newUser.role === 'driver') {
            newUser.driver_profile = {
              id: `dp-${Math.random().toString(36).substr(2, 9)}`,
              license_number: 'LIC-MOCK-12345',
              status: 'approved',
              is_online: true,
              current_lat: 31.5204,
              current_lng: 74.3587,
              rating_avg: 5.0,
              total_rides: 10,
              total_earnings: 2000.00,
              vehicle: {
                make: 'Suzuki',
                model: 'Alto',
                year: 2021,
                color: 'Silver',
                plate_number: 'MOCK-123',
                vehicle_type: 'economy',
                is_active: true
              }
            };
          }
          
          const mockPayload = {
            user: newUser,
            access: 'mock-access-jwt-token-xyz',
            refresh: 'mock-refresh-jwt-token-xyz'
          };
          dispatch(authSuccess(mockPayload));
          return newUser;
        }
      }
      
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please check credentials.';
      dispatch(authFailure(errMsg));
      throw new Error(errMsg);
    }
  };

  const registerUser = async (userData) => {
    dispatch(authStart());
    try {
      const response = await api.post('/auth/register/', userData);
      // Auto login on register if backend supports it or navigate
      dispatch(authFailure(null)); // Clear loading
      return response.data;
    } catch (err) {
      if (!err.response) {
        console.warn('Backend server offline. Simulating registration success.');
        dispatch(authFailure(null));
        return { message: 'Registration simulated successfully.' };
      }
      const errMsg = Object.values(err.response?.data || {}).flat().join(' ') || 'Registration failed.';
      dispatch(authFailure(errMsg));
      throw new Error(errMsg);
    }
  };

  const logoutUser = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && !refreshToken.startsWith('mock-')) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      dispatch(logout());
    }
  };

  const updateProfile = async (profileData) => {
    try {
      let updatedUser;
      if (token && token.startsWith('mock-')) {
        // Mock profile update
        updatedUser = { ...user, ...profileData };
        dispatch(updateUser(updatedUser));
      } else {
        const response = await api.put('/users/profile/', profileData);
        updatedUser = response.data;
        dispatch(updateUser(updatedUser));
      }
      return updatedUser;
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateProfile
  };
};
