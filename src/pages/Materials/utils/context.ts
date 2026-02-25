import { createInventoryContext } from '@context/Inventory/context';
import type {Material} from "@interfaces/material.interface.ts";

export const {
    Provider,
    useContext: useInventoryContext,
    useActions: useInventoryActions,
} = createInventoryContext<Material>();
