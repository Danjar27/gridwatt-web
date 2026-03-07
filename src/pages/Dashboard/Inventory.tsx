import { useAuthContext } from '@context/auth/context.ts';

import OrderStats from '@pages/Orders/widgets/OrderStats';
import OrdersByTechnician from '@pages/Orders/widgets/OrdersByTechnician';
import MaterialStatsWidget from '@pages/Dashboard/widgets/MaterialStatsWidget';

function Inventory() {
    const { user } = useAuthContext();
    const isManager = user?.role?.name === 'manager';

    if (!isManager) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 s768:gap-6">
            <div className="grid grid-cols-1 gap-4 s992:grid-cols-[1fr_300px]">
                <OrderStats />
                <OrdersByTechnician />
            </div>
            <MaterialStatsWidget />
        </div>
    );
}

export default Inventory;
