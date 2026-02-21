import { Provider } from './utils/context.tsx';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Users/Inventory.tsx';
import Page from '@layouts/Page.tsx';

const UsersPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="users" title={i18n('pages.users.title')} subtitle={i18n('pages.users.subtitle')}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default UsersPage;
