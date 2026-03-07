import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Seals/Inventory';
import Page from '@layouts/Page';

const SealsPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="seals" breadcrumbs={[{ label: i18n('pages.seals.title'), href: '/seals' }]}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default SealsPage;
