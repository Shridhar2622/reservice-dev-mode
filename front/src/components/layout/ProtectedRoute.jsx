import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on their actual role
        if (user.role === 'TECHNICIAN') return <Navigate to="/technician/dashboard" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
