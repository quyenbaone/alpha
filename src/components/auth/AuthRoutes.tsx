import { memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingComponent } from '../LoadingComponent';

// Protected route component
export const ProtectedRoute = memo(({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuthStore();

    if (loading) {
        return <LoadingComponent />;
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    return children;
});

// Admin route component
export const AdminRoute = memo(({ children }: { children: JSX.Element }) => {
    const { isAdmin, loading } = useAuthStore();

    if (loading) {
        return <LoadingComponent />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
});

// Owner route component
export const OwnerRoute = memo(({ children }: { children: JSX.Element }) => {
    const { userRole, loading } = useAuthStore();

    if (loading) {
        return <LoadingComponent />;
    }

    // Allow access if user is an owner or admin
    if (!(userRole === 'owner' || userRole === 'admin')) {
        return <Navigate to="/" replace />;
    }

    return children;
}); 