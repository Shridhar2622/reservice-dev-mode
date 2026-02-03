import React, { useState } from 'react';
import { useTechnician } from '../../context/TechnicianContext';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Play, CheckSquare, Loader } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../components/common/Button';

const TechnicianBookings = () => {
    const { jobs, loading, updateBookingStatus } = useTechnician();
    const [actionLoading, setActionLoading] = useState(null);

    const handleAction = async (bookingId, status) => {
        setActionLoading(bookingId);
        await updateBookingStatus(bookingId, status);
        setActionLoading(null);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;

    if (!jobs || jobs.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No bookings yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto">When customers book your services, they will appear here.</p>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            ACCEPTED: 'bg-blue-100 text-blue-700 border-blue-200',
            IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            COMPLETED: 'bg-green-100 text-green-700 border-green-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job Requests</h2>

            <div className="grid grid-cols-1 gap-6">
                {jobs.map(booking => (
                    <div key={booking._id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                            {/* Booking Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{booking.service?.title}</h3>
                                        <p className="text-slate-500 text-sm">Booking ID: #{booking._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <div className="md:hidden">
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>{booking.customer?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>{format(new Date(booking.scheduledAt), 'PPP')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span>{format(new Date(booking.scheduledAt), 'p')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{booking.customer?.location?.address || 'Location provided on acceptance'}</span>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm italic text-slate-600 dark:text-slate-400">
                                        " {booking.notes} "
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                <div className="hidden md:block mb-2">
                                    {getStatusBadge(booking.status)}
                                </div>
                                <div className="text-xl font-black text-slate-900 dark:text-white mb-2">₹{booking.price}</div>

                                {/* Action Buttons Based on Status */}
                                {booking.status === 'PENDING' && (
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0"
                                            onClick={() => handleAction(booking._id, 'REJECTED')}
                                            disabled={actionLoading === booking._id}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => handleAction(booking._id, 'ACCEPTED')}
                                            disabled={actionLoading === booking._id}
                                        >
                                            {actionLoading === booking._id ? <Loader className="w-4 h-4 animate-spin" /> : 'Accept'}
                                        </Button>
                                    </div>
                                )}

                                {booking.status === 'ACCEPTED' && (
                                    <Button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                                        onClick={() => handleAction(booking._id, 'IN_PROGRESS')}
                                        disabled={actionLoading === booking._id}
                                    >
                                        {actionLoading === booking._id ? <Loader className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4" /> Start Service</>}
                                    </Button>
                                )}

                                {booking.status === 'IN_PROGRESS' && (
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                                        onClick={() => handleAction(booking._id, 'COMPLETED')}
                                        disabled={actionLoading === booking._id}
                                    >
                                        {actionLoading === booking._id ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckSquare className="w-4 h-4" /> Complete Job</>}
                                    </Button>
                                )}

                                {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status) && (
                                    <p className="text-xs text-slate-400 font-bold uppercase mt-2">No actions available</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechnicianBookings;
