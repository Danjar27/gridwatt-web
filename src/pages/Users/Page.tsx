import { Provider } from './utils/context';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Users/Inventory';
import Page from '@layouts/Page';

const UsersPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="users" breadcrumbs={[{ label: i18n('pages.users.title'), href: '/users' }]}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default UsersPage;
