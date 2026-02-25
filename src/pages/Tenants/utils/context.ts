import { createInventoryContext } from '@context/Inventory/context';
import type {Tenant} from "@interfaces/tenant.interface.ts";

export const {
    Provider,
    useContext: useInventoryContext,
    useActions: useInventoryActions,
} = createInventoryContext<Tenant>();
