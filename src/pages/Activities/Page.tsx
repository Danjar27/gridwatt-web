import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Activities/Inventory';
import Page from '@layouts/Page';

const ActivitiesPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="activities" title={i18n('pages.activities.title')} subtitle={i18n('pages.activities.subtitle')}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default ActivitiesPage;
