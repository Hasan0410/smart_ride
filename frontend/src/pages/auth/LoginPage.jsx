import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { KeyRound, Mail, AlertTriangle, ArrowRight, ShieldCheck, User, Truck } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    setFormError('');
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setFormError('');
    try {
      const user = await login(demoEmail, 'password123');
      navigate(`/${user.role}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md animate-slide-up space-y-8">
        
        {/* Logo/Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in to book a ride or manage your profile
          </p>
        </div>

        {/* Form Container */}
        <div className="glass glass-card p-8 shadow-xl border border-gray-200/50 dark:border-gray-800/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Errors */}
            {(error || formError) && (
              <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl px-3 py-3 border border-transparent focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="bg-transparent text-sm w-full focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl px-3 py-3 border border-transparent focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                  <KeyRound size={18} className="text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent text-sm w-full focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Demo Quick Access */}
        <div className="glass glass-card p-6 border border-indigo-500/10 dark:border-indigo-500/5 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
            <ShieldCheck size={18} />
            One-Click Demo Access
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select a role to instantly log in using simulated mock profiles:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('passenger@smartride.com')}
              className="py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-xs font-semibold flex flex-col items-center gap-1 border border-indigo-500/10 transition-colors"
            >
              <User size={16} />
              Passenger
            </button>
            <button
              onClick={() => handleQuickLogin('driver@smartride.com')}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-xs font-semibold flex flex-col items-center gap-1 border border-emerald-500/10 transition-colors"
            >
              <Truck size={16} />
              Driver
            </button>
            <button
              onClick={() => handleQuickLogin('admin@smartride.com')}
              className="py-2.5 px-3 rounded-xl bg-violet-50 dark:bg-violet-950/25 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20 text-xs font-semibold flex flex-col items-center gap-1 border border-violet-500/10 transition-colors"
            >
              <ShieldCheck size={16} />
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
