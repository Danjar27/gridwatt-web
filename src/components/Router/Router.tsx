import { createBrowserRouter, Navigate } from 'react-router-dom';
import { JobsPage } from '@pages/jobs.tsx';
import { JobDetailPage } from '@pages/job-detail.tsx';
import { OrdersPage } from '@pages/orders.tsx';
import { OrderDetailPage } from '@pages/order-detail.tsx';
import { OrdersImportPage } from '@pages/orders-import.tsx';
import { MaterialsPage } from '@pages/materials.tsx';
import { ActivitiesPage } from '@pages/activities.tsx';
import { SealsPage } from '@pages/seals.tsx';
import { UsersPage } from '@pages/users.tsx';
import { ProfilePage } from '@pages/profile.tsx';

import Protected from './blocks/Protected.tsx';
import DashboardPage from '@pages/dashboard.tsx';
import LoginPage from '@pages/login.tsx';
import Root from '@layouts/Root.tsx';
import Dashboard from '@layouts/Dashboard.tsx';

const Router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
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
                element: <Protected />,
                children: [
                    {
                        element: <Dashboard />,
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
                                path: 'orders/import',
                                element: <OrdersImportPage />,
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

export default Router;
