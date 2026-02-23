import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Orders/Inventory';
import Page from '@layouts/Page';

const OrdersPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="orders" title={i18n('pages.orders.title')} subtitle={i18n('pages.orders.subtitle')} className="flex-1 min-h-0">
                <Inventory />
            </Page>
        </Provider>
    );
};

export default OrdersPage;
