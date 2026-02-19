import { createBrowserRouter, Navigate } from 'react-router-dom';
import { JobsPage } from '@pages/jobs.tsx';
import { JobDetailPage } from '@pages/job-detail.tsx';

import { OrderDetailPage } from '@pages/order-detail.tsx';
import { OrdersImportPage } from '@pages/orders-import.tsx';

import Protected from './blocks/Protected.tsx';
import DashboardPage from '@pages/dashboard.tsx';
import LoginPage from '@pages/Login.tsx';
import Root from '@layouts/Root.tsx';
import Dashboard from '@layouts/Dashboard.tsx';
import MaterialsPage from '@pages/Materials.tsx';
import ActivitiesPage from '@pages/Activities.tsx';
import SealsPage from '@pages/Seals.tsx';
import ProfilePage from '@pages/Profile.tsx';
import UsersPage from '@pages/Users.tsx';
import TenantsPage from '@pages/Tenants.tsx';
import OrdersPage from '@pages/Orders.tsx';

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
                                path: 'tenants',
                                element: <TenantsPage />,
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
