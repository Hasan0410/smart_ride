import { useState, useEffect } from 'react';

// Default: Lahore, Pakistan
const DEFAULT_COORDS = { lat: 31.5204, lng: 74.3587 };

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    loaded: false,
    coordinates: DEFAULT_COORDS,
    accuracy: null,
    error: null,
  });

  const onSuccess = (position) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      accuracy: position.coords.accuracy,
      error: null,
    });
  };

  const onError = (error) => {
    setLocation((prev) => ({
      ...prev,
      loaded: true,
      error: {
        code: error.code,
        message: error.message,
      },
    }));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      onError({
        code: 0,
        message: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
};
