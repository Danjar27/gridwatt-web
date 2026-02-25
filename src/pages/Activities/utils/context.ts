import { createInventoryContext } from '@context/Inventory/context';
import type {Activity} from "@interfaces/activity.interface.ts";

export const {
    Provider,
    useContext: useInventoryContext,
    useActions: useInventoryActions,
} = createInventoryContext<Activity>();
