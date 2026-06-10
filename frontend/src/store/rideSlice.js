import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentRide: null,
  activeRequest: null,
  estimate: null,
  history: [],
  nearbyDrivers: [],
  isLoading: false,
  error: null,
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    rideStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setEstimate: (state, action) => {
      state.isLoading = false;
      state.estimate = action.payload;
    },
    requestRideSuccess: (state, action) => {
      state.isLoading = false;
      state.activeRequest = action.payload;
    },
    setNearbyDrivers: (state, action) => {
      state.nearbyDrivers = action.payload;
    },
    setCurrentRide: (state, action) => {
      state.isLoading = false;
      state.currentRide = action.payload;
      if (action.payload) {
        state.activeRequest = null; // Clear request once ride is active
      }
    },
    setRideHistory: (state, action) => {
      state.isLoading = false;
      state.history = action.payload;
    },
    updateRideStatus: (state, action) => {
      if (state.currentRide && state.currentRide.id === action.payload.id) {
        state.currentRide.status = action.payload.status;
        if (action.payload.driver_info) {
          state.currentRide.driver_info = action.payload.driver_info;
        }
      }
    },
    updateDriverLocation: (state, action) => {
      const { driverId, lat, lng } = action.payload;
      if (state.currentRide && state.currentRide.driver_info && state.currentRide.driver_info.id === driverId) {
        state.currentRide.driver_info.current_lat = lat;
        state.currentRide.driver_info.current_lng = lng;
      }
    },
    clearRideState: (state) => {
      state.currentRide = null;
      state.activeRequest = null;
      state.estimate = null;
      state.error = null;
    },
    rideFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  rideStart,
  setEstimate,
  requestRideSuccess,
  setNearbyDrivers,
  setCurrentRide,
  setRideHistory,
  updateRideStatus,
  updateDriverLocation,
  clearRideState,
  rideFailure
} = rideSlice.actions;

export default rideSlice.reducer;
