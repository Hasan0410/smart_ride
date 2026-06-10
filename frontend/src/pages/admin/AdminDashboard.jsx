import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Car, Compass, DollarSign, ShieldAlert, CheckCircle2, 
  XCircle, MessageSquare, ListFilter, ShieldCheck, Eye, Search, AlertCircle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/notificationSlice';

// Mock charts data
const WEEKLY_RIDES = [
  { name: 'Mon', rides: 120 },
  { name: 'Tue', rides: 185 },
  { name: 'Wed', rides: 240 },
  { name: 'Thu', rides: 210 },
  { name: 'Fri', rides: 380 },
  { name: 'Sat', rides: 510 },
  { name: 'Sun', rides: 420 },
];

const REVENUE_DATA = [
  { name: 'Week 1', revenue: 45000 },
  { name: 'Week 2', revenue: 58000 },
  { name: 'Week 3', revenue: 62000 },
  { name: 'Week 4', revenue: 85000 },
];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Tab control: overview, verification, users, complaints, payments
  const [activeTab, setActiveTab] = useState('overview');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for Driver Verification
  const [pendingDrivers, setPendingDrivers] = useState([
    {
      id: 'd-991',
      name: 'Sheraz Ahmed',
      email: 'sheraz.ahmed@example.com',
      license: 'LIC-PK-45521',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      color: 'Dark Grey',
      plate: 'LE-21-4991',
      type: 'comfort'
    },
    {
      id: 'd-992',
      name: 'Zainab Bibi',
      email: 'zainab.b@example.com',
      license: 'LIC-PK-11029',
      make: 'Suzuki',
      model: 'Alto',
      year: 2020,
      color: 'White',
      plate: 'MN-20-1102',
      type: 'economy'
    }
  ]);

  // Mock Users table
  const [usersList, setUsersList] = useState([
    { id: 'u-001', name: 'Ahmed Khan', email: 'passenger@smartride.com', role: 'passenger', status: 'active' },
    { id: 'u-002', name: 'Muhammad Ali', email: 'driver@smartride.com', role: 'driver', status: 'active' },
    { id: 'u-003', name: 'Sheraz Ahmed', email: 'sheraz.ahmed@example.com', role: 'driver', status: 'pending' },
    { id: 'u-004', name: 'Zainab Bibi', email: 'zainab.b@example.com', role: 'driver', status: 'pending' },
    { id: 'u-005', name: 'Fatima Noor', email: 'fatima@example.com', role: 'passenger', status: 'suspended' },
  ]);

  // Mock complaints
  const [complaints, setComplaints] = useState([
    { id: 'c-01', user: 'Ahmed Khan', subject: 'Driver late arrival', description: 'Driver took 15 mins to arrive at Gulberg Main Boulevard. Map estimated 3 mins.', status: 'open', date: '2026-06-10T09:12:00Z' },
    { id: 'c-02', user: 'Usman Ghani', subject: 'Overcharged fare', description: 'Fare was shown as Rs. 420 but cash demanded was Rs. 500.', status: 'open', date: '2026-06-09T18:24:00Z' },
    { id: 'c-03', user: 'Ali Raza', subject: 'App crashed during payment', description: 'JazzCash payment callback took long time to credit wallet.', status: 'resolved', date: '2026-06-08T11:05:00Z' },
  ]);

  // Handle Driver approval
  const handleApproveDriver = (driverId, name) => {
    setPendingDrivers(prev => prev.filter(d => d.id !== driverId));
    setUsersList(prev => prev.map(u => u.name === name ? { ...u, status: 'active' } : u));
    
    dispatch(addNotification({
      id: `admin-n-${Math.random()}`,
      title: 'Driver Approved',
      message: `Driver license and vehicle specifications for ${name} verified successfully.`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    }));
  };

  // Handle Driver rejection
  const handleRejectDriver = (driverId, name) => {
    setPendingDrivers(prev => prev.filter(d => d.id !== driverId));
    setUsersList(prev => prev.filter(u => u.name !== name));
    
    dispatch(addNotification({
      id: `admin-n-${Math.random()}`,
      title: 'Driver Rejected',
      message: `Verification request for ${name} has been rejected due to incomplete documents.`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    }));
  };

  // User status toggler
  const handleToggleUserStatus = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        dispatch(addNotification({
          id: `admin-n-${Math.random()}`,
          title: `User ${nextStatus === 'suspended' ? 'Suspended' : 'Activated'}`,
          message: `${u.name}'s account has been successfully ${nextStatus}.`,
          type: 'system',
          is_read: false,
          created_at: new Date().toISOString()
        }));
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Resolve complaint
  const handleResolveComplaint = (complaintId) => {
    setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: 'resolved' } : c));
    dispatch(addNotification({
      id: `admin-n-${Math.random()}`,
      title: 'Complaint Resolved',
      message: `Complaint ticket ${complaintId} marked resolved. Resolution email dispatched.`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    }));
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
      
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex md:flex-col justify-around md:justify-start p-4 gap-2">
        <div className="hidden md:block px-4 py-6 text-center border-b border-gray-100 dark:border-gray-800 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md">
            S
          </div>
          <h3 className="mt-3 font-bold text-gray-800 dark:text-gray-200">System Control</h3>
          <p className="text-xs text-emerald-500 mt-1 font-bold">Admin Portal</p>
        </div>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'overview'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <Compass size={18} />
          <span className="hidden md:inline">Analytics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'verification'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <ShieldCheck size={18} />
          <span className="hidden md:inline flex-1 flex items-center justify-between">
            Verifications
            {pendingDrivers.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingDrivers.length}
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'users'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <Users size={18} />
          <span className="hidden md:inline">Manage Users</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'complaints'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
          }`}
        >
          <MessageSquare size={18} />
          <span className="hidden md:inline">Complaints Inbox</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        
        {/* Tab 1: Overview Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-slide-up">
            <h2 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h2>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-500">
                  <Users size={28} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Users</span>
                  <h4 className="text-2xl font-black">4,521</h4>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500">
                  <Car size={28} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Vehicles</span>
                  <h4 className="text-2xl font-black">1,029</h4>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="bg-violet-500/10 p-4 rounded-2xl text-violet-500">
                  <Compass size={28} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Rides</span>
                  <h4 className="text-2xl font-black">12</h4>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-sm neon-glow">
                  <DollarSign size={28} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-300 font-bold uppercase tracking-wider block">Total Revenue</span>
                  <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Rs. 250k</h4>
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Rides */}
              <div className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-gray-400 tracking-wider">Weekly Bookings Volume</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WEEKLY_RIDES}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }}/>
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }}/>
                      <Tooltip />
                      <Bar dataKey="rides" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Earnings */}
              <div className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-gray-400 tracking-wider">Revenue Growth Trend (PKR)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={REVENUE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }}/>
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }}/>
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Driver document approvals */}
        {activeTab === 'verification' && (
          <div className="space-y-6 animate-slide-up">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight">Driver Approvals</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review pending driving credentials and vehicle registration documents.</p>
            </div>

            {pendingDrivers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingDrivers.map((driver) => (
                  <div key={driver.id} className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-lg">{driver.name}</h4>
                          <span className="text-xs text-gray-400">{driver.email}</span>
                        </div>
                        <span className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200/50 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                          Pending Verification
                        </span>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-850 pt-4 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Driving License</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{driver.license}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Vehicle Spec</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{driver.make} {driver.model} ({driver.year})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Plate Number</span>
                          <span className="font-bold text-indigo-500">{driver.plate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-semibold">Class Tier</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{driver.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100 dark:border-gray-850">
                      <button
                        onClick={() => handleRejectDriver(driver.id, driver.name)}
                        className="py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={14} />
                        Reject Application
                      </button>
                      <button
                        onClick={() => handleApproveDriver(driver.id, driver.name)}
                        className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5 neon-glow"
                      >
                        <ShieldCheck size={14} />
                        Approve & Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-850 text-center rounded-3xl gap-4">
                <CheckCircle2 size={42} className="text-emerald-500" />
                <div>
                  <h4 className="font-bold">All caught up!</h4>
                  <p className="text-xs text-gray-400 mt-1">No pending driver applications require approval.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Users listings */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold tracking-tight">System Accounts</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">View and manage registered accounts on the network.</p>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm w-full md:w-72 shadow-sm">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="glass border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800/50 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-150 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850">
                    {usersList.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-850 dark:text-gray-200">{u.name}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-450">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'driver' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.status === 'active' 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                              : u.status === 'suspended'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            disabled={u.status === 'pending'}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              u.status === 'active'
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Complaints Panel */}
        {activeTab === 'complaints' && (
          <div className="space-y-6 animate-slide-up">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight">Complaints Inbox</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Handle complaints and resolve disputes logged by passengers.</p>
            </div>

            <div className="space-y-4">
              {complaints.map((c) => (
                <div key={c.id} className="glass p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Ticket #{c.id}</span>
                      <h4 className="font-extrabold text-base">{c.subject}</h4>
                      <p className="text-xs text-gray-400">Filed by {c.user} • {new Date(c.date).toLocaleString()}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      c.status === 'open' 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 animate-pulse' 
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-slate-100 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/40 leading-relaxed">
                    {c.description}
                  </p>

                  {c.status === 'open' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleResolveComplaint(c.id)}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5 neon-glow-emerald"
                      >
                        <CheckCircle2 size={14} />
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
