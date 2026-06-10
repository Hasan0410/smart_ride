import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAuth } from '../../hooks/useAuth';
import L from 'leaflet';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Power, ShieldCheck, Star, Award, DollarSign, Clock, MapPin, 
  CheckCircle2, AlertTriangle, Play, CheckSquare, X, Car
} from 'lucide-react';

const LAHORE_CENTER = [31.5204, 74.3587];

// Mock Earnings History
const MOCK_EARNINGS_DATA = [
  { day: 'Mon', earnings: 1200 },
  { day: 'Tue', earnings: 1800 },
  { day: 'Wed', earnings: 1400 },
  { day: 'Thu', earnings: 2200 },
  { day: 'Fri', earnings: 3100 },
  { day: 'Sat', earnings: 4500 },
  { day: 'Sun', earnings: 2800 },
];

export default function DriverDashboard() {
  const { user } = useAuth();
  
  // Status: online/offline
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, profile
  
  // Ride lifecycle state
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [countdown, setCountdown] = useState(15);
  
  // Map markers positions
  const [driverCoords, setDriverCoords] = useState({ lat: 31.5204, lng: 74.3587 });
  const [passengerCoords, setPassengerCoords] = useState(null);
  
  // Stats
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalRides, setTotalRides] = useState(42);
  const [onlineHours, setOnlineHours] = useState(0);

  const countdownTimerRef = useRef(null);
  const rideSimulatorTimerRef = useRef(null);
  const onlineTimerRef = useRef(null);

  // Toggle Online/Offline
  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (!nextState) {
      // Clean up timers when offline
      setIncomingRequest(null);
      if (rideSimulatorTimerRef.current) clearTimeout(rideSimulatorTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }
  };

  // Simulate an incoming request after going online
  useEffect(() => {
    if (isOnline && !incomingRequest && !activeRide) {
      console.log('Online. Simulating next passenger request in 6 seconds...');
      rideSimulatorTimerRef.current = setTimeout(() => {
        setIncomingRequest({
          id: 'ride-req-5521',
          passengerName: 'Ahmed Khan',
          passengerRating: '4.9',
          pickupAddress: 'Gulberg (Main Boulevard)',
          pickupLat: 31.5204,
          pickupLng: 74.3587,
          dropoffAddress: 'Allama Iqbal International Airport',
          dropoffLat: 31.5215,
          dropoffLng: 74.4036,
          distance: '8.5 km',
          duration: '18 mins',
          fare: 450
        });
        setCountdown(15);
      }, 6000);
    }
    return () => {
      if (rideSimulatorTimerRef.current) clearTimeout(rideSimulatorTimerRef.current);
    };
  }, [isOnline, incomingRequest, activeRide]);

  // Request countdown timer
  useEffect(() => {
    if (incomingRequest) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIncomingRequest(null);
            clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [incomingRequest]);

  // Online Hour Counter
  useEffect(() => {
    if (isOnline) {
      onlineTimerRef.current = setInterval(() => {
        setOnlineHours(prev => parseFloat((prev + 0.1).toFixed(1)));
      }, 60000); // add 0.1 every minute
    } else {
      if (onlineTimerRef.current) clearInterval(onlineTimerRef.current);
    }
    return () => {
      if (onlineTimerRef.current) clearInterval(onlineTimerRef.current);
    };
  }, [isOnline]);

  const handleAcceptRequest = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    const ride = { ...incomingRequest, status: 'accepted' };
    setIncomingRequest(null);
    setActiveRide(ride);
    setPassengerCoords({ lat: ride.pickupLat, lng: ride.pickupLng });
    
    // Animate driver moving closer to pickup
    setTimeout(() => {
      setActiveRide(prev => ({ ...prev, status: 'arriving' }));
    }, 4000);

    setTimeout(() => {
      setActiveRide(prev => ({ ...prev, status: 'arrived' }));
    }, 8000);
  };

  const handleStartRide = () => {
    setActiveRide(prev => ({ ...prev, status: 'in_progress' }));
    // Move driver towards dropoff
    setTimeout(() => {
      setDriverCoords({ lat: activeRide.dropoffLat, lng: activeRide.dropoffLng });
    }, 4000);
  };

  const handleCompleteRide = () => {
    const finalFare = activeRide.fare;
    setTodayEarnings(prev => prev + finalFare);
    setTotalRides(prev => prev + 1);
    
    setActiveRide(null);
    setPassengerCoords(null);
    setDriverCoords({ lat: activeRide.dropoffLat, lng: activeRide.dropoffLng });
  };

  const handleRejectRequest = () => {
    setIncomingRequest(null);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  // Map Controller helper
  function MapFocusController() {
    const map = useMap();
    useEffect(() => {
      const coords = [[driverCoords.lat, driverCoords.lng]];
      if (passengerCoords) coords.push([passengerCoords.lat, passengerCoords.lng]);

      if (coords.length > 1) {
        map.fitBounds(coords, { padding: [50, 50] });
      } else {
        map.setView(coords[0], 14);
      }
    }, [map]);
    return null;
  }

  // Icons
  const driverMarkerIcon = L.divIcon({
    html: `<div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
    className: 'custom-marker',
    iconSize: [32, 32]
  });

  const passengerMarkerIcon = L.divIcon({
    html: `<div class="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    className: 'custom-marker',
    iconSize: [32, 32]
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex md:flex-col items-center md:items-stretch justify-around md:justify-start p-4 gap-2">
        <div className="hidden md:block px-4 py-6 text-center border-b border-gray-100 dark:border-gray-800 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md">
            {user?.first_name[0].toUpperCase()}
          </div>
          <h3 className="mt-3 font-bold text-gray-800 dark:text-gray-200">{user?.first_name} {user?.last_name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">Driver Status: {isOnline ? 'Online' : 'Offline'}</p>
        </div>

        {/* Online Toggle Switch */}
        <button
          onClick={handleToggleOnline}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm border shadow-md transition-all duration-300 ${
            isOnline 
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20 neon-glow-emerald' 
              : 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20'
          }`}
        >
          <Power size={18} />
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>

        <div className="border-t border-gray-100 dark:border-gray-850 my-4 hidden md:block" />

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'overview'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <Award size={18} />
          <span className="hidden md:inline">Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'profile'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <Car size={18} />
          <span className="hidden md:inline">Vehicle Info</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
        
        {activeTab === 'overview' && (
          <div className="flex-1 flex flex-col lg:flex-row relative">
            
            {/* Map Area */}
            <div className="flex-1 min-h-[350px] lg:h-auto relative">
              <MapContainer 
                center={LAHORE_CENTER} 
                zoom={14} 
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Driver pin */}
                <Marker position={[driverCoords.lat, driverCoords.lng]} icon={driverMarkerIcon}>
                  <Popup>My Location</Popup>
                </Marker>

                {/* Passenger pin (only active when job accepted) */}
                {passengerCoords && (
                  <Marker position={[passengerCoords.lat, passengerCoords.lng]} icon={passengerMarkerIcon}>
                    <Popup>Passenger pickup</Popup>
                  </Marker>
                )}

                <MapFocusController />
              </MapContainer>

              {/* Status Alert Overlay */}
              {!isOnline && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-sm z-10 flex items-center justify-center p-6 text-center">
                  <div className="glass glass-card p-8 border border-white/20 max-w-sm w-full space-y-4">
                    <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                      <Power size={28} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">You are Offline</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Toggle the switch to go online and start receiving ride requests in your area.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Side Status and Earnings Panel */}
            <div className="w-full lg:w-96 p-6 space-y-6 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-10 shrink-0 lg:max-h-[85vh] overflow-y-auto">
              
              {/* Active Jobs panel */}
              {activeRide ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h3 className="font-extrabold text-sm uppercase text-gray-400 tracking-wider">Active Job</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {activeRide.status}
                    </span>
                  </div>

                  {/* Job Details Card */}
                  <div className="glass p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-sm">{activeRide.passengerName}</h4>
                        <span className="text-[10px] text-gray-400 font-bold block">Rating: ★ {activeRide.passengerRating}</span>
                      </div>
                      <span className="text-lg font-black text-emerald-500">Rs. {activeRide.fare}</span>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      <div className="flex gap-2">
                        <MapPin className="text-emerald-500 shrink-0" size={16} />
                        <div>
                          <span className="text-gray-400 block font-bold text-[10px]">PICKUP</span>
                          <span className="font-bold">{activeRide.pickupAddress}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <MapPin className="text-rose-500 shrink-0" size={16} />
                        <div>
                          <span className="text-gray-400 block font-bold text-[10px]">DROPOFF</span>
                          <span className="font-bold">{activeRide.dropoffAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions based on ride status */}
                  {activeRide.status === 'accepted' && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-semibold text-center">
                      Drive to passenger pickup location. (Route shown on map)
                    </div>
                  )}
                  {activeRide.status === 'arriving' && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-semibold text-center animate-pulse">
                      Almost there! Approaching passenger pickup location.
                    </div>
                  )}
                  {activeRide.status === 'arrived' && (
                    <button
                      onClick={handleStartRide}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Start Journey
                    </button>
                  )}
                  {activeRide.status === 'in_progress' && (
                    <button
                      onClick={handleCompleteRide}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Complete Journey
                    </button>
                  )}
                </div>
              ) : (
                /* Stats and Chart Overview */
                <div className="space-y-6">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">Performance Summary</h3>
                  
                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-1 shadow-sm">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Today Earnings</span>
                      <h4 className="text-xl font-extrabold text-emerald-500">Rs. {todayEarnings}</h4>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-1 shadow-sm">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Completed Rides</span>
                      <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalRides}</h4>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-1 shadow-sm col-span-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Online Hours</span>
                      <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{onlineHours} hrs</h4>
                    </div>
                  </div>

                  {/* Earnings Chart */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Weekly Income Analysis</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_EARNINGS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea"/>
                          <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af"/>
                          <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af"/>
                          <Tooltip />
                          <Area type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Vehicle profiles */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-2xl mx-auto w-full space-y-8 animate-slide-up">
            <h2 className="text-3xl font-extrabold tracking-tight">Registered Vehicle</h2>
            
            <div className="glass p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-500">
                  <Car size={36} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl">Toyota Corolla</h3>
                  <p className="text-xs text-gray-400">Class Category: Comfort Sedan</p>
                </div>
                <span className="ml-auto bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">VEHICLE PLATE NUMBER</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">LEB-24-1928</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">COLOR</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">White</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">REGISTRATION YEAR</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">2022</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">DRIVING LICENSE</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">LIC-PK-99128</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Incoming Request Overlay Alert modal */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-1.5">
                <Clock className="animate-spin text-indigo-600" size={16} />
                Incoming Job Request
              </span>
              <span className="text-sm font-black text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                {countdown}s remaining
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-lg shadow">
                {incomingRequest.passengerName[0].toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold">{incomingRequest.passengerName}</h4>
                <span className="text-xs text-yellow-500 font-bold block">★ {incomingRequest.passengerRating} Rating</span>
              </div>
              <span className="ml-auto text-xl font-black text-emerald-500">Rs. {incomingRequest.fare}</span>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex gap-2">
                <MapPin className="text-emerald-500 shrink-0" size={16} />
                <div>
                  <span className="text-gray-400 font-bold text-[10px] block">PICKUP</span>
                  <span className="font-bold">{incomingRequest.pickupAddress}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin className="text-rose-500 shrink-0" size={16} />
                <div>
                  <span className="text-gray-400 font-bold text-[10px] block">DROPOFF</span>
                  <span className="font-bold">{incomingRequest.dropoffAddress}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleRejectRequest}
                className="py-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 font-bold rounded-xl text-xs text-gray-500 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptRequest}
                className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors neon-glow"
              >
                Accept Request
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
