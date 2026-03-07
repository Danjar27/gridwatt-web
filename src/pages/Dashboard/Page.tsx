import { useTranslations } from 'use-intl';

import Inventory from '@pages/Dashboard/Inventory';
import Page from '@layouts/Page';

const DashboardPage = () => {
    const i18n = useTranslations();

    return (
        <Page
            id="dashboard"
            breadcrumbs={[{ label: i18n('pages.dashboard.title'), href: '/dashboard' }]}
        >
            <Inventory />
        </Page>
    );
};

export default DashboardPage;
