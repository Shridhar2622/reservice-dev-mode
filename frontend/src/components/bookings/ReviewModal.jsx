import React, { useState } from 'react';
import { Star, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import client from '../../api/client';

const ReviewModal = ({ booking, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            // Payload matches Review model requirements
            const payload = {
                review,
                rating,
                booking: booking?._id || booking?.id,
                technician: booking?.technician?._id || booking?.technician?.id,
                // category is optional if backend handles it or we can send it if needed
                // Backend model has category reference, maybe we should send it?
                // user is taken from req.user
            };

            // If category is needed and available in booking
            if (booking?.category?._id || booking?.category?.id) {
                payload.category = booking.category._id || booking.category.id;
            } else if (typeof booking?.category === 'string') {
                payload.category = booking.category;
            }

            const res = await client.post('/reviews', payload);

            if (res.data.status === 'success') {
                toast.success('Review submitted successfully!');
                if (onReviewSubmitted) onReviewSubmitted(res.data.data.review);
                onClose();
            }
        } catch (error) {
            console.error("Review submission error:", error);
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Rate Experience</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-slate-50 dark:ring-slate-800">
                                <img
                                    src={booking?.technician?.profilePhoto || booking?.technician?.technicianProfile?.profilePhoto || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100'}
                                    alt="Technician"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{booking?.technician?.name || 'Technician'}</h4>
                            <p className="text-sm text-slate-500 font-medium">{booking?.service?.title || 'Service'}</p>
                        </div>

                        <div className="flex justify-center gap-2 mb-8 user-select-none">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= (hoveredStar || rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'fill-slate-100 dark:fill-slate-800 text-slate-200 dark:text-slate-700'
                                            } transition-colors duration-200`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Write a review</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="How was the service? What did you like?"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none resize-none font-medium text-slate-900 dark:text-white transition-all h-32"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader className="animate-spin w-5 h-5" /> : 'Submit Review'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
