import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { setCurrentRide, clearRideState } from '../../store/rideSlice';
import { addNotification } from '../../store/notificationSlice';
import api from '../../api/axios';
import L from 'leaflet';
import { 
  MapPin, Navigation, Car, Wallet, History, User, CreditCard, 
  ArrowRight, CheckCircle2, ShieldAlert, Star, Search, RefreshCw, X, ShieldCheck
} from 'lucide-react';

// Default center: Lahore GPO
const LAHORE_CENTER = [31.5204, 74.3587];

// Standard Lahore Address Presets for easy offline testing
const ADDRESS_PRESETS = [
  { name: 'Gulberg (Main Boulevard)', lat: 31.5204, lng: 74.3587 },
  { name: 'Allama Iqbal International Airport', lat: 31.5215, lng: 74.4036 },
  { name: 'DHA Phase 5 (Commercial)', lat: 31.4697, lng: 74.4074 },
  { name: 'Model Town Park', lat: 31.4805, lng: 74.3256 },
  { name: 'Johar Town (Emporium Mall)', lat: 31.4678, lng: 74.2659 },
  { name: 'Mall Road (GPO)', lat: 31.5626, lng: 74.3168 },
];

// Helper to update map bounds dynamically
function MapController({ pickup, dropoff, driverCoords }) {
  const map = useMap();
  useEffect(() => {
    const coords = [];
    if (pickup) coords.push([pickup.lat, pickup.lng]);
    if (dropoff) coords.push([dropoff.lat, dropoff.lng]);
    if (driverCoords) coords.push([driverCoords.lat, driverCoords.lng]);

    if (coords.length > 1) {
      map.fitBounds(coords, { padding: [50, 50] });
    } else if (coords.length === 1) {
      map.setView(coords[0], 15);
    }
  }, [pickup, dropoff, driverCoords, map]);
  return null;
}

export default function PassengerDashboard() {
  const dispatch = useDispatch();
  const { user, updateProfile } = useAuth();
  const currentRide = useSelector(state => state.ride.currentRide);
  
  // Tabs: 'book', 'wallet', 'history', 'profile'
  const [activeTab, setActiveTab] = useState('book');
  
  // Booking Form State
  const [pickup, setPickup] = useState(ADDRESS_PRESETS[0]);
  const [dropoff, setDropoff] = useState(ADDRESS_PRESETS[1]);
  const [vehicleType, setVehicleType] = useState('comfort');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [fareEstimate, setFareEstimate] = useState(380);
  
  // Wallet state
  const [walletBalance, setWalletBalance] = useState(1500.00);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 't1', type: 'credit', amount: 2000.00, description: 'JazzCash Top-Up', date: '2026-06-09T14:32:00Z' },
    { id: 't2', type: 'debit', amount: 500.00, description: 'Ride payment (Gulberg to Airport)', date: '2026-06-09T15:10:00Z' }
  ]);

  // Profile Editor state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // WebSocket reference for notifications/bookings
  const ws = useWebSocket('notification', user?.id);

  // Calculate simulated estimate distance/fare
  useEffect(() => {
    if (pickup && dropoff) {
      // Crude distance approximation
      const dist = Math.sqrt(Math.pow(pickup.lat - dropoff.lat, 2) + Math.pow(pickup.lng - dropoff.lng, 2)) * 111; // ~111km per deg
      const rate = vehicleType === 'economy' ? 15 : vehicleType === 'comfort' ? 20 : 35;
      const base = vehicleType === 'economy' ? 90 : vehicleType === 'comfort' ? 130 : 200;
      setFareEstimate(Math.round(base + (dist * rate)));
    }
  }, [pickup, dropoff, vehicleType]);

  // Handle Booking submission
  const handleBookRide = () => {
    const rideId = `ride-${Math.random().toString(36).substr(2, 9)}`;
    const ridePayload = {
      id: rideId,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_address: pickup.name,
      dropoff_lat: dropoff.lat,
      dropoff_lng: dropoff.lng,
      dropoff_address: dropoff.name,
      vehicle_type: vehicleType,
      payment_method: paymentMethod,
      fare_amount: fareEstimate,
      distance_km: parseFloat((fareEstimate / 25).toFixed(1))
    };

    // Trigger simulation via websocket hook
    ws.sendData({
      type: 'request_ride',
      payload: ridePayload
    });
  };

  // Handle Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // In demo, just append to history and show alert
    dispatch(addNotification({
      id: `n-review-${Math.random()}`,
      title: 'Review Submitted',
      message: 'Thank you for your feedback! Your rating has been saved.',
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    }));
    
    // Debit wallet if payment method was wallet
    if (currentRide && currentRide.payment_method === 'wallet') {
      setWalletBalance(prev => Math.max(0, prev - currentRide.fare_amount));
      setTransactions(prev => [
        {
          id: `t-${Math.random()}`,
          type: 'debit',
          amount: currentRide.fare_amount,
          description: `Ride Fare to ${currentRide.dropoff_address}`,
          date: new Date().toISOString()
        },
        ...prev
      ]);
    }

    setShowReviewModal(false);
    dispatch(clearRideState());
    setComment('');
  };

  // Handle JazzCash Wallet Top-Up
  const handleTopup = (e) => {
    e.preventDefault();
    if (!topupAmount || parseFloat(topupAmount) <= 0) return;
    
    setTopupLoading(true);
    // Simulate JazzCash payment gateway redirection and response
    setTimeout(() => {
      setWalletBalance(prev => prev + parseFloat(topupAmount));
      setTransactions(prev => [
        {
          id: `t-${Math.random()}`,
          type: 'credit',
          amount: parseFloat(topupAmount),
          description: 'JazzCash Wallet Top-Up',
          date: new Date().toISOString()
        },
        ...prev
      ]);
      dispatch(addNotification({
        id: `n-topup-${Math.random()}`,
        title: 'Payment Completed',
        message: `Rs. ${topupAmount} has been credited to your wallet via JazzCash.`,
        type: 'payment',
        is_read: false,
        created_at: new Date().toISOString()
      }));
      setTopupAmount('');
      setTopupLoading(false);
    }, 2000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaved(true);
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone
    });
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/accounts/profile/delete/');
      // The API deletes the account. Clear local state and reload.
      localStorage.removeItem('persist:root');
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  // Open review modal when ride reaches completed status
  useEffect(() => {
    if (currentRide && currentRide.status === 'completed') {
      setShowReviewModal(true);
    }
  }, [currentRide]);

  // Leaflet Marker Icons
  const pickupIcon = L.divIcon({
    html: `<div class="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const dropoffIcon = L.divIcon({
    html: `<div class="bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const driverIcon = L.divIcon({
    html: `<div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg neon-glow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex md:flex-col items-center md:items-stretch justify-around md:justify-start p-4 gap-2">
        <div className="hidden md:block px-4 py-6 text-center border-b border-gray-100 dark:border-gray-800 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md">
            {user?.first_name[0].toUpperCase()}
          </div>
          <h3 className="mt-3 font-bold text-gray-800 dark:text-gray-200">{user?.first_name} {user?.last_name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
        </div>

        <button
          onClick={() => setActiveTab('book')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'book'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <Navigation size={18} />
          <span className="hidden md:inline">Book a Ride</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'wallet'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <Wallet size={18} />
          <span className="hidden md:inline">My Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'history'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <History size={18} />
          <span className="hidden md:inline">Ride History</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'profile'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <User size={18} />
          <span className="hidden md:inline">Profile Settings</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-slate-50 dark:bg-slate-950">
        
        {/* Tab 1: Book a Ride */}
        {activeTab === 'book' && (
          <div className="flex-1 flex flex-col lg:flex-row relative">
            
            {/* Map Container */}
            <div className="flex-1 min-h-[350px] lg:h-auto relative">
              <MapContainer 
                center={LAHORE_CENTER} 
                zoom={13} 
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {pickup && (
                  <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                    <Popup>Pickup: {pickup.name}</Popup>
                  </Marker>
                )}
                {dropoff && (
                  <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
                    <Popup>Dropoff: {dropoff.name}</Popup>
                  </Marker>
                )}
                
                {/* Active driver tracking */}
                {currentRide?.driver_info?.current_lat && (
                  <Marker 
                    position={[currentRide.driver_info.current_lat, currentRide.driver_info.current_lng]} 
                    icon={driverIcon}
                  >
                    <Popup>Driver: {currentRide.driver_info.user.first_name}</Popup>
                  </Marker>
                )}

                <MapController 
                  pickup={pickup} 
                  dropoff={dropoff} 
                  driverCoords={
                    currentRide?.driver_info?.current_lat 
                      ? { lat: currentRide.driver_info.current_lat, lng: currentRide.driver_info.current_lng } 
                      : null
                  } 
                />
              </MapContainer>
            </div>

            {/* Booking Panel Overlay */}
            <div className="w-full lg:w-96 p-6 space-y-6 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-10 shrink-0 lg:max-h-[85vh] overflow-y-auto">
              {!currentRide ? (
                <>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Request a Ride</h2>
                    <p className="text-xs text-gray-400">Select your locations and vehicle preference.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Pickup selection */}
                    <div>
                      <label className="text-xs text-gray-500 font-bold block mb-1">PICKUP LOCATION</label>
                      <select
                        value={ADDRESS_PRESETS.findIndex(a => a.name === pickup.name)}
                        onChange={(e) => setPickup(ADDRESS_PRESETS[e.target.value])}
                        className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2.5 border border-transparent focus:border-indigo-500 focus:outline-none text-sm font-medium"
                      >
                        {ADDRESS_PRESETS.map((preset, index) => (
                          <option key={index} value={index}>{preset.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dropoff selection */}
                    <div>
                      <label className="text-xs text-gray-500 font-bold block mb-1">DROPOFF LOCATION</label>
                      <select
                        value={ADDRESS_PRESETS.findIndex(a => a.name === dropoff.name)}
                        onChange={(e) => setDropoff(ADDRESS_PRESETS[e.target.value])}
                        className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2.5 border border-transparent focus:border-indigo-500 focus:outline-none text-sm font-medium"
                      >
                        {ADDRESS_PRESETS.map((preset, index) => (
                          <option key={index} value={index}>{preset.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Vehicle selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold block">VEHICLE CLASS</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['economy', 'comfort', 'premium'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setVehicleType(type)}
                          className={`py-2 px-1.5 rounded-xl border capitalize text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                            vehicleType === type
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                              : 'border-gray-200 dark:border-gray-800 bg-transparent text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <Car size={16} />
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold block">PAYMENT METHOD</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('wallet')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                          paymentMethod === 'wallet'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600'
                            : 'border-gray-200 dark:border-gray-800 text-gray-500'
                        }`}
                      >
                        <CreditCard size={14} />
                        SmartWallet
                      </button>
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                          paymentMethod === 'cash'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600'
                            : 'border-gray-200 dark:border-gray-800 text-gray-500'
                        }`}
                      >
                        <Wallet size={14} />
                        Cash on Ride
                      </button>
                    </div>
                  </div>

                  {/* Estimate container */}
                  <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-400">ESTIMATED FARE</span>
                        <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400">Rs. {fareEstimate}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">WALLET BALANCE</span>
                        <span className={`text-sm font-bold ${walletBalance >= fareEstimate ? 'text-emerald-500' : 'text-rose-500'}`}>
                          Rs. {walletBalance}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleBookRide}
                    disabled={paymentMethod === 'wallet' && walletBalance < fareEstimate}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 neon-glow"
                  >
                    Request Ride Now
                    <ArrowRight size={18} />
                  </button>
                  {paymentMethod === 'wallet' && walletBalance < fareEstimate && (
                    <p className="text-[10px] text-rose-500 font-bold text-center">
                      * Insufficient wallet balance. Please top up or select Cash.
                    </p>
                  )}
                </>
              ) : (
                /* Live Ride Tracking Panel */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">Live Ride Tracking</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 animate-pulse">
                      {currentRide.status}
                    </span>
                  </div>

                  {/* Driver Profile Summary Card */}
                  {currentRide.driver_info ? (
                    <div className="glass p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow">
                          {currentRide.driver_info.user.first_name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-gray-850 dark:text-gray-200">
                            {currentRide.driver_info.user.first_name} {currentRide.driver_info.user.last_name}
                          </h4>
                          <p className="text-xs text-gray-400 capitalize">{currentRide.driver_info.vehicle.make} {currentRide.driver_info.vehicle.model} • {currentRide.driver_info.vehicle.color}</p>
                        </div>
                        <div className="text-right">
                          <span className="flex items-center gap-0.5 text-xs text-yellow-500 font-bold justify-end">
                            <Star size={12} fill="currentColor" />
                            {currentRide.driver_info.rating_avg}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{currentRide.driver_info.vehicle.plate_number}</span>
                        </div>
                      </div>

                      {/* Dynamic statuses layout */}
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
                        {currentRide.status === 'accepted' && (
                          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                            <ShieldCheck size={16} />
                            Driver is heading to your pickup location.
                          </div>
                        )}
                        {currentRide.status === 'arriving' && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            <Navigation size={16} className="animate-spin" />
                            Driver is arriving now! Get ready to board.
                          </div>
                        )}
                        {currentRide.status === 'in_progress' && (
                          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                            <Car size={16} className="animate-pulse" />
                            Ride started. En route to {currentRide.dropoff_address}.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center gap-4">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <h4 className="font-bold text-sm">Finding Nearest Driver...</h4>
                        <p className="text-xs text-gray-400 mt-1">Matching your request with online partners.</p>
                      </div>
                    </div>
                  )}

                  {/* Ride Info Panel */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">PICKUP</span>
                      <span className="font-bold truncate max-w-[180px]">{currentRide.pickup_address}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">DROPOFF</span>
                      <span className="font-bold truncate max-w-[180px]">{currentRide.dropoff_address}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">FARE</span>
                      <span className="font-bold text-indigo-600">Rs. {currentRide.fare_amount} ({currentRide.payment_method})</span>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {currentRide.status !== 'completed' && currentRide.status !== 'in_progress' && (
                    <button
                      onClick={() => dispatch(clearRideState())}
                      className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-500/20 text-xs transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Cancel Ride Request
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Wallet tab */}
        {activeTab === 'wallet' && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-slide-up">
            <h2 className="text-3xl font-extrabold tracking-tight">SmartWallet</h2>
            
            {/* Wallet Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Balance display */}
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-6 rounded-3xl text-white shadow-lg space-y-4 md:col-span-2">
                <span className="text-xs uppercase font-extrabold opacity-85 tracking-widest block">Available Balance</span>
                <h3 className="text-5xl font-black">Rs. {walletBalance.toFixed(2)}</h3>
                <div className="flex justify-between items-center pt-4 border-t border-white/20 text-xs">
                  <span>SmartRide Wallet ID: WR-{user?.id.substr(0,8)}</span>
                  <span className="bg-emerald-500 px-3 py-1 rounded-full font-bold uppercase">ACTIVE</span>
                </div>
              </div>

              {/* Top Up Box */}
              <div className="glass p-6 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-md">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-500" />
                  Top Up Wallet
                </h4>
                <form onSubmit={handleTopup} className="space-y-4">
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Enter amount (Rs.)"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-transparent focus:border-indigo-500 focus:outline-none text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={topupLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {topupLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      'Pay with JazzCash'
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* Transactions Log */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xl">Transaction History</h3>
              <div className="glass rounded-3xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between text-sm hover:bg-slate-500/5 transition-colors">
                    <div>
                      <p className="font-bold text-gray-850 dark:text-gray-200">{tx.description}</p>
                      <span className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                    <span className={`font-extrabold text-base ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'credit' ? '+' : '-'} Rs. {tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6 animate-slide-up">
            <h2 className="text-3xl font-extrabold tracking-tight">Ride History</h2>
            <div className="glass rounded-3xl border border-gray-150 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.filter(t => t.description.startsWith('Ride')).map((ride, index) => (
                <div key={index} className="p-6 flex items-center justify-between hover:bg-slate-500/5 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-850 dark:text-gray-200">Muhammad Ali (Comfort class)</h4>
                    <p className="text-xs text-gray-400">{ride.description}</p>
                    <span className="text-[10px] text-gray-400 font-semibold block">{new Date(ride.date).toLocaleString()}</span>
                  </div>
                  <div className="text-right space-y-2">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block">Rs. {ride.amount.toFixed(2)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      COMPLETED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-2xl mx-auto w-full space-y-8 animate-slide-up">
            <h2 className="text-3xl font-extrabold tracking-tight">Profile Settings</h2>
            
            <div className="glass p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md">
              <form onSubmit={handleProfileSave} className="space-y-6">
                
                {profileSaved && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 size={18} />
                    Profile saved successfully.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-650 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-transparent focus:border-indigo-500 focus:outline-none text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-655 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-transparent focus:border-indigo-500 focus:outline-none text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-660 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-transparent focus:border-indigo-500 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-660 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full bg-slate-100/50 dark:bg-slate-800/40 rounded-xl px-3 py-2.5 border border-transparent text-sm text-gray-400 font-semibold cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all duration-300 neon-glow"
                >
                  Save Changes
                </button>

              </form>

              <div className="mt-8 pt-8 border-t border-rose-500/20">
                <h4 className="text-rose-600 dark:text-rose-400 font-bold mb-2">Danger Zone</h4>
                <p className="text-xs text-gray-500 mb-4">Deleting your account is permanent. Your personal data will be anonymized.</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-500/20 transition-all duration-300"
                >
                  Delete My Account
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Delete Account?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure? This action cannot be undone. Your personal data will be permanently anonymized.
              </p>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ride Completion & Rating Modal */}
      {showReviewModal && currentRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in text-center">
            
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Ride Completed!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have arrived safely. Please rate your experience with Muhammad Ali.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-all duration-200 hover:scale-125 ${
                    rating >= star ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave feedback (optional)"
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 border border-transparent focus:border-indigo-500 focus:outline-none text-sm"
                rows={3}
              />
              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-md neon-glow"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
