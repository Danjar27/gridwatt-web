import { createBrowserRouter, Navigate } from 'react-router-dom';
import { JobDetailPage } from '@pages/job-detail';

import { OrderDetailPage } from '@pages/order-detail';
import { OrdersImportPage } from '@pages/orders-import';

import Protected from './blocks/Protected';
import DashboardPage from '@pages/dashboard';
import LoginPage from '@pages/Login';
import Root from '@layouts/Root';
import Dashboard from '@layouts/Dashboard';
import MaterialsPage from '@pages/Materials/Page';
import ActivitiesPage from '@pages/Activities/Page';
import SealsPage from '@pages/Seals/Page';
import ProfilePage from '@pages/Profile';
import UsersPage from '@pages/Users/Page';
import CreateOrderPage from '@pages/Orders/CreatePage';
import OrdersPage from '@pages/Orders/Page';
import JobsPage from '@pages/Jobs/Page';
import TenantsPage from '@pages/Tenants/Page';

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
                                path: 'orders/new',
                                element: <CreateOrderPage />,
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
