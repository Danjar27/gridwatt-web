import { useTranslations } from 'use-intl';

import Inventory from '@pages/Dashboard/Inventory';
import Page from '@layouts/Page';

const DashboardPage = () => {
    const i18n = useTranslations();

    return (
        <Page
            id="dashboard"
            title={i18n('pages.dashboard.title')}
        >
            <Inventory />
        </Page>
    );
};

export default DashboardPage;
