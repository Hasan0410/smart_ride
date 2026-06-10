import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  
  return {
    user: user ? JSON.parse(user) : null,
    token: token || null,
    refreshToken: refresh || null,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    authStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      const { user, access, refresh } = action.payload;
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = access;
      state.refreshToken = refresh;
      state.error = null;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    },
    authFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('access_token', action.payload);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
});

export const { authStart, authSuccess, authFailure, updateToken, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
