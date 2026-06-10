import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin, Award, Navigation, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-8 md:px-20 py-20 bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full z-10">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-400 text-sm font-semibold">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              Real-time Ride Booking Platform
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Your Journey, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
              Book rides instantly, track your driver live on the map, and experience premium transport services. Fully optimized for speed, reliability, and security.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 neon-glow"
              >
                Book Your Ride Now
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register?role=driver"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-semibold rounded-2xl transition-all duration-300"
              >
                Become a Driver
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center items-center lg:justify-end animate-fade-in">
            {/* Visual Glass Card */}
            <div className="glass glass-card max-w-md w-full p-8 space-y-6 text-slate-900 dark:text-slate-100 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Navigation className="animate-bounce" size={20} />
                  Quick Fare Estimate
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold">
                  Pakistan
                </span>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">PICKUP LOCATION</label>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-indigo-500">
                    <MapPin className="text-emerald-500" size={18} />
                    <input
                      type="text"
                      placeholder="Enter pickup address"
                      defaultValue="Gulberg, Lahore"
                      className="bg-transparent text-sm w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-bold block mb-1">DROPOFF LOCATION</label>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-indigo-500">
                    <MapPin className="text-rose-500" size={18} />
                    <input
                      type="text"
                      placeholder="Enter destination address"
                      defaultValue="Allama Iqbal International Airport"
                      className="bg-transparent text-sm w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl p-4 border border-indigo-500/10">
                <div>
                  <span className="text-xs text-gray-400 block">ESTIMATED FARE</span>
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">Rs. 420 - 550</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">EST. DURATION</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">18 mins (8.5 km)</span>
                </div>
              </div>

              <Link
                to="/login"
                className="block text-center w-full py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-xl transition-all duration-300"
              >
                Sign In to Book
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold">Select Your SmartRide Comfort</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Pick the vehicle class that fits your group, preference, and budget. Transparent pricing guaranteed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Economy */}
            <div className="glass glass-card p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-500">
                  <Navigation size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-2xl">Economy</h3>
                  <p className="text-sm text-slate-500">Everyday affordable transport. Compact, clean hatchbacks and sedans for prompt commuting.</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">BASE RATE</span>
                <span className="font-extrabold text-lg text-emerald-500">Rs. 90 + Rs. 15/km</span>
              </div>
            </div>

            {/* Comfort */}
            <div className="glass glass-card p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between border-indigo-500/30 ring-2 ring-indigo-500/10">
              <div className="space-y-6">
                <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-500">
                  <Award size={28} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-2xl">Comfort</h3>
                    <span className="bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">POPULAR</span>
                  </div>
                  <p className="text-sm text-slate-500">Spacious sedans with premium air conditioning, extra legroom, and highly-rated experienced drivers.</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">BASE RATE</span>
                <span className="font-extrabold text-lg text-indigo-500">Rs. 130 + Rs. 20/km</span>
              </div>
            </div>

            {/* Premium */}
            <div className="glass glass-card p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="bg-violet-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-violet-500">
                  <Shield size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-2xl">Premium</h3>
                  <p className="text-sm text-slate-500">Travel in luxury. High-end luxury cars, business sedans, SUVs, and elite chauffeur level service.</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">BASE RATE</span>
                <span className="font-extrabold text-lg text-violet-500">Rs. 200 + Rs. 35/km</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="py-20 px-8 bg-slate-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-extrabold tracking-tight">Your Safety is Our Priority</h2>
            <p className="text-slate-600 dark:text-slate-300">
              We vet every driver, inspect vehicles regularly, and provide 24/7 incident response. Our app features panic alarms, trip sharing, and instant dispute resolution.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500 h-fit">
                  <Shield size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Verified Vehicles & Drivers</h4>
                  <p className="text-sm text-slate-500">Document verifications done by admins manually before any driver starts accepting requests.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-500 h-fit">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Real-Time GPS Tracking</h4>
                  <p className="text-sm text-slate-500">Share your live location and route details with your friends and family members at any time.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500 h-fit">
                  <Star size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Two-Way Rating System</h4>
                  <p className="text-sm text-slate-500">Passengers and drivers rate each other to ensure a respectful and high-quality community.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-md text-center space-y-2">
              <h4 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">100k+</h4>
              <p className="text-sm font-bold text-slate-500 uppercase">Rides Completed</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-md text-center space-y-2">
              <h4 className="text-4xl font-extrabold text-emerald-500">4.8★</h4>
              <p className="text-sm font-bold text-slate-500 uppercase">Average Rating</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-md text-center space-y-2">
              <h4 className="text-4xl font-extrabold text-violet-500">1,500+</h4>
              <p className="text-sm font-bold text-slate-500 uppercase">Active Drivers</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-md text-center space-y-2">
              <h4 className="text-4xl font-extrabold text-indigo-500">99.9%</h4>
              <p className="text-sm font-bold text-slate-500 uppercase">Reliability Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-extrabold text-white text-lg">SmartRide Inc.</p>
          <p className="text-xs">© 2026 SmartRide. All rights reserved. Built with React + Tailwind + Django REST Framework.</p>
        </div>
      </footer>
    </div>
  );
}
