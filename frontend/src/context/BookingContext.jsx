import React, { createContext, useState, useContext } from 'react';


const BookingContext = createContext();

export const useBookings = () => useContext(BookingContext);

import { useUser } from './UserContext';
import client from '../api/client';

export const BookingProvider = ({ children }) => {
    const { isAuthenticated } = useUser();
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to transform backend booking
    const transformBooking = (doc) => {
        const dateObj = new Date(doc.scheduledAt);
        const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Map status (backend UPPERCASE to Title Case)
        const statusMap = {
            'PENDING': 'Pending',
            'ACCEPTED': 'Assigned',
            'IN_PROGRESS': 'Assigned',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Canceled'
        };

        return {
            id: doc._id || doc.id,
            serviceId: doc.service?._id || doc.service,
            serviceName: doc.service?.title || 'Unknown Service',
            status: statusMap[doc.status] || doc.status,
            date,
            time,
            price: doc.price,
            technician: doc.technician ? {
                name: doc.technician.name,
                image: doc.technician.photo || 'https://via.placeholder.com/150',
                phone: doc.technician.phone || '',
                id: doc.technician._id
            } : null,
            image: 'https://images.unsplash.com/photo-1581578731117-1045293d2f28?q=80&w=400' // Placeholder as booking doesn't link to image directly easily without service lookup
        };
    };

    // Fetch bookings when user logs in
    React.useEffect(() => {
        const fetchBookings = async () => {
            if (!isAuthenticated) {
                setBookings([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await client.get('/bookings');
                let rawBookings = [];
                // Check response structure for JSend or direct array
                if (res.data.data && Array.isArray(res.data.data)) {
                    rawBookings = res.data.data;
                } else if (res.data.data && res.data.data.docs) {
                    rawBookings = res.data.data.docs;
                } else if (res.data.data && res.data.data.bookings) {
                    rawBookings = res.data.data.bookings;
                }

                setBookings(rawBookings.map(transformBooking));

            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [isAuthenticated]);

    const addBooking = async (newBooking) => {
        try {
            const res = await client.post('/bookings', newBooking);
            if (res.data.status === 'success') {
                const createdBooking = res.data.data.booking || res.data.data.data;
                setBookings(prev => [transformBooking(createdBooking), ...prev]);
            }
        } catch (err) {
            console.warn("Backend booking failed (Guest Mode). Adding locally.", err);
            // Fallback: Create a fake booking object locally
            const fakeBooking = {
                _id: Date.now().toString(),
                service: { title: newBooking.serviceName },
                status: 'PENDING',
                scheduledAt: new Date().toISOString(),
                price: newBooking.price,
                // ... map other fields if needed for display
            };
            setBookings(prev => [transformBooking(fakeBooking), ...prev]);
        }
    };

    const cancelBooking = async (id) => {
        try {
            await client.patch(`/bookings/${id}`, { status: 'Canceled' });
            setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Canceled' } : b));
        } catch (err) {
            console.error("Failed to cancel booking", err);
        }
    };

    const updateBookingStatus = async (id, status) => {
        try {
            await client.patch(`/bookings/${id}`, { status });
            setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    return (
        <BookingContext.Provider value={{ bookings, isLoading, addBooking, cancelBooking, updateBookingStatus }}>
            {children}
        </BookingContext.Provider>
    );
};
