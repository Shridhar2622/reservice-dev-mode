import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ShieldCheck, Clock, User } from 'lucide-react';
import client from '../../api/client';
import Button from '../../components/common/Button';
import { useBookings } from '../../context/BookingContext';
import { useUser } from '../../context/UserContext';
import BookingModal from '../../components/bookings/BookingModal';

const ServiceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addBooking } = useBookings();
    const { isAuthenticated } = useUser();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                // Fetch service details
                const res = await client.get(`/services/${id}`);
                setService(res.data.data.service);

                // Fetch reviews (Assuming an endpoint exists, or mock for now as requested)
                // const reviewsRes = await client.get(`/services/${id}/reviews`);
                // setReviews(reviewsRes.data.data.reviews);

                // Mock Reviews for demonstration as requested "where we can see public review"
                setReviews([
                    { id: 1, user: 'Rahul Kumar', rating: 5, comment: 'Excellent service! Very professional.', date: '2 days ago' },
                    { id: 2, user: 'Priya Singh', rating: 4, comment: 'Good work, but arrived a bit late.', date: '1 week ago' },
                    { id: 3, user: 'Amit S.', rating: 5, comment: 'Fixed the issue in 10 minutes. Highly recommend.', date: '2 weeks ago' }
                ]);

            } catch (err) {
                console.error("Failed to fetch service details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceDetails();
    }, [id]);

    const handleBookClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = (bookingData) => {
        addBooking(bookingData);
        setIsBookingModalOpen(false);
        navigate('/bookings');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!service) return <div className="min-h-screen flex items-center justify-center">Service not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh]">
                <img
                    src={service.headerImage || service.image || 'https://images.unsplash.com/photo-1581578731117-104f2a41d58e?auto=format&fit=crop&q=80'}
                    alt={service.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold uppercase tracking-wider text-sm">
                            <span className="bg-rose-500/20 px-3 py-1 rounded-full backdrop-blur-md border border-rose-500/30">
                                {service.category}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-4">{service.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-slate-200">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="text-white font-bold">{service.rating || 4.8}</span> ({reviews.length} reviews)
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-5 h-5" />
                                <span>60 mins estimated</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-5 h-5 text-green-400" />
                                <span>Verified Professional</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this Service</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            {service.description}
                        </p>
                    </div>

                    {/* Reviews */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Customer Reviews</h2>
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{review.user}</div>
                                                <div className="text-xs text-slate-500">{review.date}</div>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 ml-13 pl-13">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Booking */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-slate-500 text-sm font-medium mb-1">Total Price</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">₹{service.price}</span>
                                    {service.originalPrice && (
                                        <span className="text-lg text-slate-400 line-through decoration-2">₹{service.originalPrice}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <div className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                                Secure Payment
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                                    <Clock className="w-3.5 h-3.5" />
                                </div>
                                24/7 Support
                            </li>
                        </ul>

                        <Button size="lg" className="w-full justify-center py-4 text-lg" onClick={handleBookClick}>
                            Book Now
                        </Button>
                        <p className="text-center text-xs text-slate-400 mt-4">No charges until service completion</p>
                    </div>
                </div>
            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                service={service}
                onConfirm={handleConfirmBooking}
            />
        </div>
    );
};

export default ServiceDetailsPage;
