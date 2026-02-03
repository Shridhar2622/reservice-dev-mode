import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, CheckCircle, User, Calendar, ChevronRight, Search, History, XCircle, TrendingUp, ShieldQuestion, Phone, Mail, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import { useBookings } from '../../context/BookingContext';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import MobileBookingsPage from './MobileBookingsPage';

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Assigned: 'bg-blue-100 text-blue-700 border-blue-200',
        Completed: 'bg-green-100 text-green-700 border-green-200',
        Canceled: 'bg-red-100 text-red-700 border-red-200',
    };

    const icons = {
        Pending: Clock,
        Assigned: User,
        Completed: CheckCircle,
        Canceled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
};

const BookingCard = ({ booking }) => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="flex flex-col sm:flex-row gap-5">
                {/* Service Image */}
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                        src={booking.image}
                        alt={booking.serviceName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{booking.serviceName}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {booking.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {booking.time}
                                    </div>
                                </div>
                            </div>
                            <StatusBadge status={booking.status} />
                        </div>

                        {/* Technician Info (if assigned) */}
                        {booking.technician && (
                            <div className="mt-3 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                                <img
                                    src={booking.technician.image}
                                    alt={booking.technician.name}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                                />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Technician</p>
                                    <p className="text-sm font-semibold text-slate-900">{booking.technician.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 sm:mt-0 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsWidget = () => {
    const { bookings } = useBookings();

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Activity Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-blue-600 text-xs uppercase font-bold tracking-wider mb-1">Active</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {bookings.filter(b => ['Pending', 'Assigned'].includes(b.status)).length}
                    </p>
                </div>
            </div>
        </div>
    );
};

const SupportWidget = () => (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg shadow-slate-900/10">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <ShieldQuestion className="w-5 h-5 text-blue-400" />
            Need Help?
        </h3>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Having trouble with a booking? Our support team is available 24/7.
        </p>
        <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@reservice.com</span>
            </div>
        </div>
    </div>
);

const BookingsPage = () => {
    const [activeTab, setActiveTab] = useState('Pending'); // Pending, Assigned, Completed, History
    const { bookings } = useBookings();
    const { user, isAuthenticated, isLoading } = useUser();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    useGSAP(() => {
        gsap.from(".animate-item", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        });
    }, { scope: containerRef });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

    if (!user) return null;

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'History') return ['Completed', 'Canceled'].includes(b.status);
        if (activeTab === 'Pending') return b.status === 'Pending';
        if (activeTab === 'Assigned') return b.status === 'Assigned';
        if (activeTab === 'Completed') return b.status === 'Completed';
        return true;
    });

    return (
        <>
            <div className="block md:hidden">
                <MobileBookingsPage />
            </div>
            <div ref={containerRef} className="hidden md:block relative min-h-screen bg-slate-50 selection:bg-blue-100 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-300/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Dashboard Header */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 items-end animate-item">
                        <div className="lg:col-span-2">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Welcome, {user.name.split(' ')[0]} <Sparkles className="inline-block w-8 h-8 text-yellow-400 ml-2 fill-yellow-400" />
                            </h1>
                            <p className="text-slate-500">Here's the status of your service requests.</p>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="grid grid-cols-2 w-full gap-3 md:flex md:w-auto lg:w-full">
                                <Button
                                    variant="outline"
                                    className={`w-full h-full md:w-auto lg:flex-1 justify-center gap-2 ${activeTab === 'History' ? 'bg-slate-100 border-slate-300' : 'bg-white'}`}
                                    onClick={() => setActiveTab('History')}
                                >
                                    <History className="w-4 h-4" />
                                    <span>History</span>
                                </Button>
                                <Link to="/services" className="w-full h-full md:w-auto lg:flex-1">
                                    <Button className="w-full h-full md:w-auto md:px-6 lg:w-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                                        + Book  Service
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8 animate-item">
                            {/* Tabs */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="flex border-b border-slate-100">
                                    {['Pending', 'Assigned', 'Completed'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* List Content */}
                            <div className="space-y-4">
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-4 text-slate-400">
                                            <Search className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-slate-900 font-medium mb-1">No {activeTab.toLowerCase()} requests</h3>
                                        <p className="text-slate-500 text-sm">You don't have any requests in this category.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Area */}
                        <div className="space-y-6 animate-item">
                            <StatsWidget />
                            <SupportWidget />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingsPage;
