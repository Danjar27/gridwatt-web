import { useAuthContext } from '@context/auth/context.ts';

import OrderStats from '@pages/Orders/widgets/OrderStats';
import MaterialStatsWidget from '@pages/Dashboard/widgets/MaterialStatsWidget';
import TechnicianStatsWidget from '@pages/Dashboard/widgets/TechnicianStatsWidget';
import ExportToolbar from '@pages/Dashboard/widgets/ExportToolbar';

const PRIVILEGED_ROLES = ['admin', 'manager', 'consultant'] as const;
const EXPORT_ROLES = ['admin', 'manager'] as const;

function Inventory() {
    const { user } = useAuthContext();
    const roleName = user?.role?.name;
    const isPrivileged = roleName !== undefined && (PRIVILEGED_ROLES as ReadonlyArray<string>).includes(roleName);
    const canExport = roleName !== undefined && (EXPORT_ROLES as ReadonlyArray<string>).includes(roleName);

    if (!isPrivileged) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 s768:gap-6">
            {canExport && <ExportToolbar />}
            <div className="grid grid-cols-1 s992:grid-cols-[320px_1fr] gap-4 s768:gap-6 items-start">
                <OrderStats />
                <MaterialStatsWidget />
            </div>
            <TechnicianStatsWidget />
        </div>
    );
}

export default Inventory;
