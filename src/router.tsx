import { lazy } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppWrapper } from './components/app/AppWrapper';
import { AdminRoute, OwnerRoute, ProtectedRoute } from './components/auth/AuthRoutes';

// Configure future flags for React Router
// This gets called before the React Router is initialized
declare global {
    interface Window {
        __reactRouterFutureFlags: {
            v7_startTransition: boolean;
            v7_relativeSplatPath: boolean;
            v7_normalizeFormMethod: boolean;
        };
    }
}

// Set future flags globally
window.__reactRouterFutureFlags = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_normalizeFormMethod: true
};

// Lazy load components to improve initial load time
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Equipment = lazy(() => import('./pages/Equipment').then(module => ({ default: module.Equipment })));
const EquipmentDetail = lazy(() => import('./pages/EquipmentDetail').then(module => ({ default: module.EquipmentDetail })));
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const SignIn = lazy(() => import('./pages/SignIn').then(module => ({ default: module.SignIn })));
const SignUp = lazy(() => import('./pages/SignUp').then(module => ({ default: module.SignUp })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })));
const Messages = lazy(() => import('./pages/Messages').then(module => ({ default: module.Messages })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminReports = lazy(() => import('./pages/AdminReports').then(module => ({ default: module.AdminReports })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(module => ({ default: module.AdminUsers })));
const AdminEquipment = lazy(() => import('./pages/AdminEquipment').then(module => ({ default: module.AdminEquipment })));
const AdminRentals = lazy(() => import('./pages/AdminRentals').then(module => ({ default: module.AdminRentals })));
const AdminSettings = lazy(() => import('./pages/AdminSettings').then(module => ({ default: module.AdminSettings })));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard').then(module => ({ default: module.default })));
const OwnerEquipment = lazy(() => import('./pages/OwnerEquipment').then(module => ({ default: module.default })));
const OwnerRentals = lazy(() => import('./pages/OwnerRentals').then(module => ({ default: module.default })));
const OwnerSettings = lazy(() => import('./pages/OwnerSettings').then(module => ({ default: module.default })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(module => ({ default: module.AuthCallback })));

// Create router with future flags enabled
export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<AppWrapper />}>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="equipment" element={<Equipment />} />
                <Route path="equipment/:id" element={<EquipmentDetail />} />
                <Route path="cart" element={
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                } />
                <Route path="profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
            </Route>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/messages" element={
                <ProtectedRoute>
                    <Messages />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <AdminRoute>
                    <AdminDashboard />
                </AdminRoute>
            } />
            <Route path="/admin/reports" element={
                <AdminRoute>
                    <AdminReports />
                </AdminRoute>
            } />
            <Route path="/admin/users" element={
                <AdminRoute>
                    <AdminUsers />
                </AdminRoute>
            } />
            <Route path="/admin/equipment" element={
                <AdminRoute>
                    <AdminEquipment />
                </AdminRoute>
            } />
            <Route path="/admin/rentals" element={
                <AdminRoute>
                    <AdminRentals />
                </AdminRoute>
            } />
            <Route path="/admin/settings" element={
                <AdminRoute>
                    <AdminSettings />
                </AdminRoute>
            } />

            {/* Owner Routes */}
            <Route path="/owner" element={
                <OwnerRoute>
                    <OwnerDashboard />
                </OwnerRoute>
            } />
            <Route path="/owner/equipment" element={
                <OwnerRoute>
                    <OwnerEquipment />
                </OwnerRoute>
            } />
            <Route path="/owner/rentals" element={
                <OwnerRoute>
                    <OwnerRentals />
                </OwnerRoute>
            } />
            <Route path="/owner/settings" element={
                <OwnerRoute>
                    <OwnerSettings />
                </OwnerRoute>
            } />

            <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
    )
); 