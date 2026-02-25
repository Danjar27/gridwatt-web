import { Provider } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Materials/Inventory';
import Page from '@layouts/Page';

const MaterialsPage = () => {
    const i18n = useTranslations();

    return (
        <Provider>
            <Page id="materials" title={i18n('pages.materials.title')} subtitle={i18n('pages.materials.subtitle')}>
                <Inventory />
            </Page>
        </Provider>
    );
};

export default MaterialsPage;
