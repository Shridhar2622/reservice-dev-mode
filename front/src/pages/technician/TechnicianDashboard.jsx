import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { CheckCircle, XCircle, Clock, MapPin, DollarSign, Briefcase, Plus, Package, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') || 'incoming';
    const setActiveTab = (tab) => setSearchParams({ tab });

    const [bookings, setBookings] = useState([]);
    const [myServices, setMyServices] = useState([]);
    const [stats, setStats] = useState({ totalEarnings: 0, completedJobs: 0 });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const currentUserId = user?._id || user?.id;
            console.log('Fetching dashboard data for user:', currentUserId);
            const [bookingRes, statsRes, profileRes, servicesRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/bookings/stats'),
                api.get('/technicians/me'),
                api.get(`/services?technician=${currentUserId}`)
            ]);
            setBookings(bookingRes.data.data.bookings || []);
            setStats(statsRes.data.data.stats || { totalEarnings: 0, completedJobs: 0 });

            const profileData = profileRes.data.data.profile;
            setProfile(profileData);

            // Prioritize services from profile (DB Array) as requested, fallback to search query
            const profileServices = profileData?.services || [];
            const queriedServices = servicesRes.data.data.services || [];

            // ROBUST MERGE: Combine both sources to ensure nothing is missed
            // Create a map to deduplicate by _id
            const serviceMap = new Map();
            queriedServices.forEach(s => serviceMap.set(s._id, s));
            profileServices.forEach(s => serviceMap.set(s._id, s));

            setMyServices(Array.from(serviceMap.values()));

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await api.delete(`/services/${serviceId}`);
            toast.success('Service deleted successfully');
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleToggleOnline = async () => {
        try {
            const newStatus = !profile?.isOnline;
            const { data } = await api.patch('/technicians/status', { isOnline: newStatus });
            setProfile(prev => ({ ...prev, isOnline: data.data.isOnline }));
            toast.success(`You are now ${newStatus ? 'ONLINE' : 'OFFLINE'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
            toast.success(`Booking ${newStatus === 'REJECTED' ? 'cancelled' : newStatus.toLowerCase()}`);
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Status update failed');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'incoming') return booking.status === 'PENDING';
        if (activeTab === 'pending') return ['ACCEPTED', 'IN_PROGRESS'].includes(booking.status);
        if (activeTab === 'completed') return booking.status === 'COMPLETED';
        return false;
    });

    const getStatusBadge = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'ACCEPTED': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-purple-100 text-purple-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'CANCELLED': 'bg-gray-100 text-gray-800'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-indigo-600">
                <Navbar />
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
                    <p className="font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // If we have a profile and it says it's completed, we trust it more than the stale user object
    const isOnboarded = user?.isTechnicianOnboarded || profile?.isProfileCompleted;

    if (!loading && !isOnboarded) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                            <Briefcase size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
                        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                            Welcome, {user?.name}! Set up your pro profile and documents to start earning.
                        </p>
                        <Link to="/technician/onboarding">
                            <Button size="lg" className="w-full sm:w-auto px-10 rounded-xl">
                                Start Onboarding
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Stats Header Area */}
            <div className="bg-indigo-600 text-white pt-10 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold">Technician Dashboard</h1>
                            <p className="text-indigo-100 opacity-80 mt-1">Manage your business and track earnings</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                                <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Earnings</p>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="text-green-400" size={24} />
                                    <span className="text-2xl font-bold">${stats.totalEarnings}</span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                                <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1">Status</p>
                                <button
                                    onClick={handleToggleOnline}
                                    className={`flex items-center gap-2 font-bold px-4 py-1 rounded-full text-sm transition-all ${profile?.isOnline
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-900/20'
                                        : 'bg-gray-400 text-gray-100'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${profile?.isOnline ? 'bg-white animate-pulse' : 'bg-gray-200'}`} />
                                    {profile?.isOnline ? 'ONLINE' : 'OFFLINE'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="bg-white shadow-xl shadow-indigo-100/50 rounded-3xl border border-gray-100 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                        {[
                            { id: 'incoming', label: 'Incoming Requests', icon: Clock },
                            { id: 'pending', label: 'Pending Jobs', icon: Briefcase },
                            { id: 'completed', label: 'Completed', icon: CheckCircle },
                            { id: 'services', label: 'My Services', icon: Package },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-8 py-5 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {tab.id !== 'services' && bookings.filter(b => {
                                    if (tab.id === 'incoming') return b.status === 'PENDING';
                                    if (tab.id === 'pending') return ['ACCEPTED', 'IN_PROGRESS'].includes(b.status);
                                    if (tab.id === 'completed') return b.status === 'COMPLETED';
                                    return false;
                                }).length > 0 && (
                                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                            {bookings.filter(b => {
                                                if (tab.id === 'incoming') return b.status === 'PENDING';
                                                if (tab.id === 'pending') return ['ACCEPTED', 'IN_PROGRESS'].includes(b.status);
                                                if (tab.id === 'completed') return b.status === 'COMPLETED';
                                                return false;
                                            }).length}
                                        </span>
                                    )}
                                {tab.id === 'services' && myServices.length > 0 && (
                                    <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                                        {myServices.length}
                                    </span>
                                )}
                            </button>
                        ))}
                        <div className="flex-1"></div>
                        <div className="px-6 flex items-center">
                            <Button variant="ghost" size="sm" onClick={fetchDashboardData} className="text-gray-400 hover:text-indigo-600">
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'services' ? (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Manage Services</h2>
                                    <Link to="/technician/create-service">
                                        <Button size="sm" className="flex items-center gap-2">
                                            <Plus size={16} />
                                            Add Service
                                        </Button>
                                    </Link>
                                </div>

                                {myServices.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myServices.map((service) => (
                                            <div key={service._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-indigo-500">
                                                {service.headerImage && (
                                                    <div className="h-40 overflow-hidden">
                                                        <img src={service.headerImage} alt={service.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">
                                                            {service.category}
                                                        </span>
                                                        <span className="text-lg font-bold text-gray-900">${service.price}</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
                                                    <div className="flex gap-2 pt-4 border-t border-gray-50 mt-2">
                                                        <Link to={`/technician/edit-service/${service._id}`} className="flex-1">
                                                            <Button variant="outline" size="sm" className="w-full py-2 flex items-center justify-center gap-1.5 text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                                                                <Edit2 size={14} />
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteService(service._id)}
                                                            className="flex-none aspect-square p-2 text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center">
                                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                                            <Package size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">No services yet</h3>
                                        <p className="text-gray-500 mb-6">Create your first service to start getting bookings!</p>
                                        <Link to="/technician/create-service">
                                            <Button>Add New Service</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : filteredBookings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredBookings.map((booking) => (
                                    <div key={booking._id} className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-indigo-200 hover:shadow-lg transition-all">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex gap-4">
                                                <div className="shrink-0 h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                    <Briefcase size={28} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900">{booking.service?.title}</h3>
                                                        {getStatusBadge(booking.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-medium mb-3">Client: {booking.customer?.name}</p>

                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                            <Clock size={14} />
                                                            {new Date(booking.scheduledAt).toLocaleDateString()} @ {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                            <MapPin size={14} />
                                                            {booking.address || 'Service Location'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                            <DollarSign size={14} />
                                                            ${booking.service?.price || 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-auto flex flex-wrap gap-3">
                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            size="md"
                                                            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 rounded-xl px-6"
                                                            onClick={() => handleStatusUpdate(booking._id, 'ACCEPTED')}
                                                        >
                                                            Accept Job
                                                        </Button>
                                                        <Button
                                                            size="md"
                                                            variant="secondary"
                                                            className="flex-1 md:flex-none text-red-600 border-red-100 hover:bg-red-50 rounded-xl px-6"
                                                            onClick={() => handleStatusUpdate(booking._id, 'REJECTED')}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}
                                                {booking.status === 'ACCEPTED' && (
                                                    <Button
                                                        size="md"
                                                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8"
                                                        onClick={() => handleStatusUpdate(booking._id, 'IN_PROGRESS')}
                                                    >
                                                        Start Working
                                                    </Button>
                                                )}
                                                {booking.status === 'IN_PROGRESS' && (
                                                    <Button
                                                        size="md"
                                                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 rounded-xl px-8"
                                                        onClick={() => handleStatusUpdate(booking._id, 'COMPLETED')}
                                                    >
                                                        Complete Now
                                                    </Button>
                                                )}
                                                {booking.status === 'COMPLETED' && (
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-4 py-2 rounded-xl">
                                                            <CheckCircle size={18} />
                                                            Job Finished
                                                        </div>
                                                        {booking.review && (
                                                            <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100 max-w-xs text-right">
                                                                <div className="flex items-center justify-end gap-1 mb-1">
                                                                    <span className="font-bold text-yellow-700">{booking.review.rating}.0</span>
                                                                    <div className="flex">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <svg key={i} className={`w-3 h-3 ${i < booking.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-gray-600 italic">"{booking.review.review}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <Briefcase size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">No jobs in this section</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    {activeTab === 'incoming'
                                        ? "When clients book your services, their requests will appear here."
                                        : activeTab === 'pending'
                                            ? "You don't have any active jobs at the moment."
                                            : "Your completed job history will be listed here."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
