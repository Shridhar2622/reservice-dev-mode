import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewModal from '../components/ui/ReviewModal';

const DashboardPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get active tab from URL or default to 'active'
    const activeTab = searchParams.get('tab') || 'active';

    // Helper to set tab
    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    // Removed selectedBookingId, using selectedBooking instead

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings');
            setBookings(data.data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'ACCEPTED': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-purple-100 text-purple-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'CANCELLED': 'bg-gray-100 text-gray-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800'
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100'} uppercase tracking-wide`}>{status}</span>;
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.patch(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            console.error('Failed to cancel booking', error);
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const [selectedBooking, setSelectedBooking] = useState(null);

    const openReviewModal = (booking) => {
        setSelectedBooking(booking);
        setReviewModalOpen(true);
    };

    const handleReviewSuccess = () => {
        // Optionally refresh bookings to update status if backend returned updated booking
        // For now just close, maybe disable button if we tracked 'hasReview'
        fetchBookings();
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'active') return ['PENDING', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status);
        if (activeTab === 'history') return ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status);
        return false;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="bg-indigo-600 text-white pt-10 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                    <p className="text-indigo-100 mt-2">Welcome back, {user?.name}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-125">

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Active Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Booking History
                        </button>
                    </div>

                    <div className="p-6">
                        {filteredBookings.length > 0 ? (
                            <div className="space-y-4">
                                {filteredBookings.map((booking) => (
                                    <div key={booking._id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        <div className="shrink-0 h-16 w-16 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-2xl">
                                            {booking.service?.title?.charAt(0) || 'S'}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{booking.service?.title || 'Unknown Service'}</h3>
                                                {getStatusBadge(booking.status)}
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                                    <Calendar size={14} />
                                                    {new Date(booking.scheduledAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                                    <Clock size={14} />
                                                    {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                {booking.technician && (
                                                    <div className="flex items-center gap-1.5 font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                        <span>Tech: {booking.technician.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-2xl font-bold text-gray-900">${booking.price || booking.service?.price}</p>

                                            {/* Cancel Button */}
                                            {['PENDING', 'ACCEPTED'].includes(booking.status) && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}

                                            {/* Review Button */}
                                            {booking.status === 'COMPLETED' && (
                                                <button
                                                    onClick={() => openReviewModal(booking)}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${booking.review
                                                        ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                                                        : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-100'
                                                        }`}
                                                >
                                                    {booking.review ? 'Edit Review' : 'Leave Review'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings here</h3>
                                <p className="text-gray-500 text-sm">
                                    {activeTab === 'active' ? "You don't have any upcoming jobs." : "No past booking history found."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {reviewModalOpen && (
                <ReviewModal
                    bookingId={selectedBooking?._id}
                    initialData={selectedBooking?.review}
                    onClose={() => setReviewModalOpen(false)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
};

export default DashboardPage;
