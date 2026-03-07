import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Orders/Inventory';
import Page from '@layouts/Page';

const OrdersPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page
                id="orders"
                breadcrumbs={[{ label: i18n('pages.orders.title'), href: '/orders' }]}
                className="flex-1 min-h-0"
            >
                <Inventory />
            </Page>
        </Provider>
    );
};

export default OrdersPage;
