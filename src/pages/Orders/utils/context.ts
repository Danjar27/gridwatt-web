import { createInventoryContext } from '@context/Inventory/context';
import type {Order} from "@interfaces/order.interface.ts";

export const {
    Provider,
    useContext: useInventoryContext,
    useActions: useInventoryActions,
} = createInventoryContext<Order>();
