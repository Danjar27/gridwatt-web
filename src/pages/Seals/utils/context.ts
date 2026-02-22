import type { Seal } from '@lib/api-client.ts';

import { createInventoryContext } from '@context/Inventory/context';

export const {
    Provider,
    useContext: useInventoryContext,
    useActions: useInventoryActions,
} = createInventoryContext<Seal>();
