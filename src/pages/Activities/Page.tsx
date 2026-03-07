import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Activities/Inventory';
import Page from '@layouts/Page';

const ActivitiesPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="activities" breadcrumbs={[{ label: i18n('pages.activities.title'), href: '/activities' }]}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default ActivitiesPage;
