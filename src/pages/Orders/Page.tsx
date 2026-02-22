import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Orders/Inventory.tsx';
import Page from '@layouts/Page.tsx';

const OrdersPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="orders" title={i18n('pages.orders.title')} subtitle={i18n('pages.orders.subtitle')}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default OrdersPage;
