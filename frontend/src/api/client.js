import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:5001/api/v1', // Hardcoded for immediate fix
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json'
    },
});

// Response interceptor for global error handling
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        // You could trigger a toast notification here if you add a toast library
        if (error.response?.status !== 401) {
            console.error('API Error:', message);
        }
        return Promise.reject(error);
    }
);

export default client;
