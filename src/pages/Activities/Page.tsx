import { Provider } from './utils/context.ts';
import Inventory from '@pages/Activities/Inventory.tsx';

const Page = () => (
    <Provider>
        <Inventory />
    </Provider>
);

export default Page;
