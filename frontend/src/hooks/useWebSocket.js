import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateRideStatus, updateDriverLocation, setCurrentRide } from '../store/rideSlice';
import { addNotification } from '../store/notificationSlice';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

export const useWebSocket = (type, id) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const authState = useSelector((state) => state.auth);
  const isMock = authState.token?.startsWith('mock-');
  
  // Simulation Timer reference
  const simIntervalRef = useRef(null);

  // Clean up simulation timers
  const clearSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  }, []);

  // Simulator for ride booking lifecycle when backend is offline
  const startRideSimulation = useCallback((rideData) => {
    clearSimulation();
    console.log('Starting client-side ride lifecycle simulation...');
    
    // Initial request status
    dispatch(setCurrentRide({
      ...rideData,
      status: 'requested',
      passenger_name: `${authState.user?.first_name} ${authState.user?.last_name}`,
      passenger_phone: authState.user?.phone
    }));

    let step = 0;
    const steps = [
      // 1. Accept ride after 3s
      {
        delay: 3000,
        action: () => {
          dispatch(setCurrentRide({
            ...rideData,
            status: 'accepted',
            driver_info: {
              id: 'd1111111-2222-3333-4444-555555555555',
              license_number: 'LIC-PK-99128',
              status: 'approved',
              is_online: true,
              current_lat: rideData.pickup_lat + 0.005, // Driver starts slightly away
              current_lng: rideData.pickup_lng + 0.005,
              rating_avg: 4.8,
              total_rides: 104,
              vehicle: {
                make: 'Toyota',
                model: 'Corolla',
                color: 'White',
                plate_number: 'LEB-24-1928',
                vehicle_type: rideData.vehicle_type || 'comfort'
              },
              user: {
                first_name: 'Muhammad',
                last_name: 'Ali',
                phone: '+923009876543'
              }
            }
          }));
          dispatch(addNotification({
            id: `n-${Math.random()}`,
            title: 'Ride Accepted',
            message: 'Driver Muhammad Ali has accepted your ride request.',
            type: 'ride_update',
            is_read: false,
            created_at: new Date().toISOString()
          }));
        }
      },
      // 2. Driver arriving and moving towards pickup
      {
        delay: 6000,
        action: () => {
          // Move driver slightly closer to pickup
          dispatch(updateDriverLocation({
            driverId: 'd1111111-2222-3333-4444-555555555555',
            lat: rideData.pickup_lat + 0.002,
            lng: rideData.pickup_lng + 0.002
          }));
          dispatch(updateRideStatus({ id: rideData.id, status: 'arriving' }));
          dispatch(addNotification({
            id: `n-${Math.random()}`,
            title: 'Driver Arriving',
            message: 'Your driver is arriving at your pickup location.',
            type: 'ride_update',
            is_read: false,
            created_at: new Date().toISOString()
          }));
        }
      },
      // 3. Driver arrives at pickup
      {
        delay: 9000,
        action: () => {
          dispatch(updateDriverLocation({
            driverId: 'd1111111-2222-3333-4444-555555555555',
            lat: rideData.pickup_lat,
            lng: rideData.pickup_lng
          }));
          dispatch(addNotification({
            id: `n-${Math.random()}`,
            title: 'Driver Arrived',
            message: 'Muhammad Ali has arrived at your location. Please proceed to the vehicle.',
            type: 'ride_update',
            is_read: false,
            created_at: new Date().toISOString()
          }));
        }
      },
      // 4. Start ride (In Progress) and move towards destination
      {
        delay: 13000,
        action: () => {
          dispatch(updateRideStatus({ id: rideData.id, status: 'in_progress' }));
          dispatch(addNotification({
            id: `n-${Math.random()}`,
            title: 'Ride Started',
            message: 'Your ride is in progress. Have a safe journey!',
            type: 'ride_update',
            is_read: false,
            created_at: new Date().toISOString()
          }));
        }
      },
      // 5. Driver is halfway to destination
      {
        delay: 17000,
        action: () => {
          // Midpoint latitude/longitude calculation
          const midLat = (rideData.pickup_lat + rideData.dropoff_lat) / 2;
          const midLng = (rideData.pickup_lng + rideData.dropoff_lng) / 2;
          dispatch(updateDriverLocation({
            driverId: 'd1111111-2222-3333-4444-555555555555',
            lat: midLat,
            lng: midLng
          }));
        }
      },
      // 6. Complete ride
      {
        delay: 22000,
        action: () => {
          dispatch(updateDriverLocation({
            driverId: 'd1111111-2222-3333-4444-555555555555',
            lat: rideData.dropoff_lat,
            lng: rideData.dropoff_lng
          }));
          dispatch(updateRideStatus({ id: rideData.id, status: 'completed' }));
          dispatch(addNotification({
            id: `n-${Math.random()}`,
            title: 'Ride Completed',
            message: 'You have arrived at your destination. Thank you for riding with SmartRide.',
            type: 'payment',
            is_read: false,
            created_at: new Date().toISOString()
          }));
        }
      }
    ];

    const executeNextStep = () => {
      if (step < steps.length) {
        simIntervalRef.current = setTimeout(() => {
          steps[step].action();
          step++;
          executeNextStep();
        }, steps[step - 1] ? steps[step].delay - steps[step - 1].delay : steps[step].delay);
      }
    };
    
    executeNextStep();
  }, [dispatch, authState.user, clearSimulation]);

  useEffect(() => {
    if (!id || isMock) {
      if (isMock) {
        setIsConnected(true);
      }
      return;
    }

    let url = '';
    const tokenParam = authState.token ? `?token=${authState.token}` : '';
    if (type === 'ride') {
      url = `${WS_BASE_URL}/rides/${id}/${tokenParam}`;
    } else if (type === 'location') {
      url = `${WS_BASE_URL}/location/${id}/${tokenParam}`;
    } else if (type === 'notification') {
      url = `${WS_BASE_URL}/notifications/${id}/${tokenParam}`;
    }

    if (!url) return;

    console.log(`Connecting to WebSocket: ${url}`);
    
    const connect = () => {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log(`WebSocket connected: ${type}`);
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket Message Received:', data);

        if (type === 'ride') {
          if (data.type === 'ride_status_update') {
            dispatch(updateRideStatus(data.payload));
          } else if (data.type === 'driver_location_update') {
            dispatch(updateDriverLocation(data.payload));
          }
        } else if (type === 'notification') {
          dispatch(addNotification(data.payload));
        }
      };

      socket.onclose = (e) => {
        console.log(`WebSocket disconnected: ${type}. Reconnecting in 3s...`, e.reason);
        setIsConnected(false);
        setTimeout(() => {
          if (socketRef.current === socket) {
            connect();
          }
        }, 3000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket Error:', err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearSimulation();
    };
  }, [type, id, isMock, dispatch, clearSimulation]);

  const sendData = useCallback((data) => {
    if (isMock) {
      // Handle simulated operations
      console.log('Simulating WebSocket send:', data);
      if (data.type === 'request_ride') {
        startRideSimulation(data.payload);
      }
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }, [isMock, startRideSimulation]);

  return {
    isConnected,
    sendData,
    simulateRide: startRideSimulation,
    clearSimulation
  };
};
