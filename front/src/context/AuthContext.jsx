import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data.data.user);
            } catch (error) {
                // Not logged in
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            const userData = data.data.user;
            setUser(userData);
            toast.success('Login successful!');
            return userData;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return null;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            const newUserData = data.data.user;
            setUser(newUserData);
            toast.success('Registration successful!');
            return newUserData;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return null;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success('Logged out successfully');
            return true;
        } catch (error) {
            console.error('Logout error', error);
            return false;
        }
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.data.user);
            return data.data.user;
        } catch (error) {
            console.error('Refresh user error', error);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
