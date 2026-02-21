import InventoryProvider from '@context/Inventory/provider.tsx';
import Inventory from '@pages/Activities/Inventory.tsx';

const Page = () => (
    <InventoryProvider type="activity">
        <Inventory />
    </InventoryProvider>
);

export default Page;
