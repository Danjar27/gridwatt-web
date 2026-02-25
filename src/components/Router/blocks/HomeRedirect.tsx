import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@context/auth/context.ts';

const roleRoutes: Record<string, string> = {
    admin: '/tenants',
    manager: '/dashboard',
    technician: '/jobs',
};

const HomeRedirect = () => {
    const { user } = useAuthContext();
    const role = user?.role?.name;
    const to = (role && roleRoutes[role]) ?? '/dashboard';

    return <Navigate to={to} replace />;
};

export default HomeRedirect;
