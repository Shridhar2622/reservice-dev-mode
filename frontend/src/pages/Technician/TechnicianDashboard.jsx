import React, { useState } from 'react';
import { useTechnician } from '../../context/TechnicianContext';
import { useUser } from '../../context/UserContext';
import { Switch } from '@headlessui/react';
import {
    LayoutDashboard, ClipboardList, Wallet, User,
    Bell
} from 'lucide-react';
import TechnicianServices from './TechnicianServices';
import TechnicianBookings from './TechnicianBookings'; // Import

const TechnicianDashboard = () => {
    const { technicianProfile, updateStatus, loading, stats, updateProfileData } = useTechnician(); // Get stats & updateProfile
    const { user, logout } = useUser();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        bio: '',
        skills: '',
        profilePhoto: null,
        preview: null
    });

    if (loading && !technicianProfile) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

    const toggleStatus = (checked) => {
        updateStatus(checked);
    };

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'services', label: 'My Services', icon: ClipboardList },
        { id: 'jobs', label: 'Bookings', icon: ClipboardList }, // Reuse icon or change
        { id: 'earnings', label: 'Earnings', icon: Wallet },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 z-20 transition-all ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                        T
                    </div>
                    <span className="font-extrabold text-xl text-slate-900 dark:text-white">Technician</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-2">Status</p>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${technicianProfile?.isOnline ? 'text-green-600' : 'text-slate-500'}`}>
                                {technicianProfile?.isOnline ? 'Online' : 'Offline'}
                            </span>
                            <Switch
                                checked={technicianProfile?.isOnline || false}
                                onChange={toggleStatus}
                                className={`${technicianProfile?.isOnline ? 'bg-green-500' : 'bg-slate-300'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                            >
                                <span
                                    className={`${technicianProfile?.isOnline ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-red-500 text-sm font-bold hover:bg-red-50 rounded-lg transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                        <h1 className="font-bold text-lg text-slate-900 dark:text-white">Dashboard</h1>
                    </div>
                    <button className="relative p-2">
                        <Bell className="w-6 h-6 text-slate-600" />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </header>

                <div className="p-4 md:p-8 space-y-8 pb-24 md:pb-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            {/* Responsive Grid for Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Earnings</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">₹{stats?.totalEarnings || 0}</h3>
                                    <span className="text-xs font-bold text-green-500 flex items-center mt-2">
                                        <TrendingUpIcon /> Lifetime
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Completed Jobs</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats?.completedJobs || 0}</h3>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Rating</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1">
                                        {technicianProfile?.avgRating || 'New'} <span className="text-yellow-400 text-lg">★</span>
                                    </h3>
                                </div>
                                <div className="bg-blue-600 p-6 rounded-3xl md:flex flex-col justify-between hidden text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-blue-200 text-xs font-bold uppercase mb-1">Status</p>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-black">{technicianProfile?.isOnline ? 'Accepting Jobs' : 'Offline'}</h3>
                                            <Switch
                                                checked={technicianProfile?.isOnline || false}
                                                onChange={toggleStatus}
                                                className={`${technicianProfile?.isOnline ? 'bg-green-400' : 'bg-white/20'
                                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                            >
                                                <span
                                                    className={`${technicianProfile?.isOnline ? 'translate-x-6' : 'translate-x-1'
                                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Status Card */}
                            <div className="md:hidden bg-blue-600 p-6 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-blue-500/30">
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-200 text-xs font-bold uppercase mb-1">Current Status</p>
                                        <h3 className="text-xl font-black">{technicianProfile?.isOnline ? 'You are Online' : 'You are Offline'}</h3>
                                        <p className="text-sm text-blue-100 mt-1">{technicianProfile?.isOnline ? 'Waiting for new requests...' : 'Go online to receive jobs'}</p>
                                    </div>
                                    <Switch
                                        checked={technicianProfile?.isOnline || false}
                                        onChange={toggleStatus}
                                        className={`${technicianProfile?.isOnline ? 'bg-green-400' : 'bg-white/20'
                                            } relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none`}
                                    >
                                        <span
                                            className={`${technicianProfile?.isOnline ? 'translate-x-7' : 'translate-x-1'
                                                } inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md`}
                                        />
                                    </Switch>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <TechnicianServices />
                    )}

                    {activeTab === 'jobs' && (
                        <TechnicianBookings />
                    )}

                    {activeTab === 'earnings' && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                            <Wallet className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">Earnings Details</h3>
                            <h1 className="text-4xl font-black text-slate-900 mt-2">₹{stats?.totalEarnings || 0}</h1>
                            <p className="text-slate-500 mt-2">Total earnings from completed jobs.</p>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8">
                            {isEditingProfile ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Profile</h2>
                                        <button onClick={() => setIsEditingProfile(false)} className="text-slate-500 hover:text-slate-700 font-bold">Cancel</button>
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg relative cursor-pointer group">
                                            <img
                                                src={
                                                    editForm.preview ||
                                                    (technicianProfile?.profilePhoto?.startsWith('http')
                                                        ? technicianProfile.profilePhoto
                                                        : `http://localhost:5000/public/img/users/${technicianProfile?.profilePhoto || 'default.jpg'}`)
                                                }
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + user?.name}
                                            />
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <span className="text-xs font-bold">Change</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setEditForm(prev => ({ ...prev, profilePhoto: file, preview: URL.createObjectURL(file) }));
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                                            <p className="text-xs text-slate-500">Click image to upload new photo</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            rows="4"
                                            placeholder="Tell customers about your experience..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editForm.skills}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Plumbing, Wiring, Repair..."
                                        />
                                    </div>

                                    <button
                                        onClick={async () => {
                                            const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);
                                            await updateProfileData({
                                                bio: editForm.bio,
                                                skills: skillsArray,
                                                profilePhoto: editForm.profilePhoto
                                            });
                                            setIsEditingProfile(false);
                                        }}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg">
                                                <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg">
                                                    <img
                                                        src={
                                                            technicianProfile?.profilePhoto?.startsWith('http')
                                                                ? technicianProfile.profilePhoto
                                                                : `http://localhost:5000/public/img/users/${technicianProfile?.profilePhoto || 'default.jpg'}`
                                                        }
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + user?.name}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h2>
                                                <p className="text-slate-500 font-medium">{user?.email}</p>
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mt-2">Technician</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditForm({
                                                    bio: technicianProfile?.bio || '',
                                                    skills: technicianProfile?.skills?.join(', ') || '',
                                                    profilePhoto: null,
                                                    preview: null
                                                });
                                                setIsEditingProfile(true);
                                            }}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">About</h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {technicianProfile?.bio || "No bio added yet. Click edit to add details about your experience."}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {technicianProfile?.skills && technicianProfile.skills.length > 0 ? (
                                                technicianProfile.skills.map(skill => (
                                                    <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 italic">No skills listed</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <button onClick={logout} className="w-full md:w-auto px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between md:hidden z-30 pb-safe">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400'
                                }`}
                        >
                            <item.icon className="w-6 h-6" strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </main>
        </div>
    );
};

const TrendingUpIcon = () => (
    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

export default TechnicianDashboard;
