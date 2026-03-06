import { Provider } from './utils/context';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Tenants/Inventory';
import Page from '@layouts/Page';

const TenantsPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="tenants" title={i18n('pages.tenants.title')}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default TenantsPage;
