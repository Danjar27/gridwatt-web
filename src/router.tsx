import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/root-layout';
import { DashboardLayout } from './layouts/dashboard-layout';
import { JobsPage } from './pages/jobs';
import { JobDetailPage } from './pages/job-detail';
import { OrdersPage } from './pages/orders';
import { OrderDetailPage } from './pages/order-detail';
import { MaterialsPage } from './pages/materials';
import { ActivitiesPage } from './pages/activities';
import { SealsPage } from './pages/seals';
import { UsersPage } from './pages/users';
import { ProfilePage } from './pages/profile';
import { ProtectedRoute } from './components/protected-route';

import DashboardPage from './pages/dashboard';
import LoginPage from './pages/login';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            {
                                path: 'dashboard',
                                element: <DashboardPage />,
                            },
                            {
                                path: 'jobs',
                                element: <JobsPage />,
                            },
                            {
                                path: 'jobs/:id',
                                element: <JobDetailPage />,
                            },
                            {
                                path: 'orders',
                                element: <OrdersPage />,
                            },
                            {
                                path: 'orders/:id',
                                element: <OrderDetailPage />,
                            },
                            {
                                path: 'materials',
                                element: <MaterialsPage />,
                            },
                            {
                                path: 'activities',
                                element: <ActivitiesPage />,
                            },
                            {
                                path: 'seals',
                                element: <SealsPage />,
                            },
                            {
                                path: 'users',
                                element: <UsersPage />,
                            },
                            {
                                path: 'profile',
                                element: <ProfilePage />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);
