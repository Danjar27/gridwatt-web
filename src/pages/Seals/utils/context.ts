import { createInventoryContext } from '@context/Inventory/context';
import type {Seal} from "@interfaces/seal.interface.ts";

export const {
    Provider,
    useContext: useInventoryContext,
    useActions: useInventoryActions,
} = createInventoryContext<Seal>();
