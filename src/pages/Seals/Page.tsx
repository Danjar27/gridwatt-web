import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Seals/Inventory.tsx';
import Page from '@layouts/Page.tsx';

const SealsPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="seals" title={i18n('pages.seals.title')} subtitle={i18n('pages.seals.subtitle')}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default SealsPage;
