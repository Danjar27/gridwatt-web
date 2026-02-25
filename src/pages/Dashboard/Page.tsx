import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';

import Inventory from '@pages/Dashboard/Inventory';
import Page from '@layouts/Page';

const DashboardPage = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();

    return (
        <Page
            id="dashboard"
            title={i18n('pages.dashboard.title')}
            subtitle={i18n('pages.dashboard.subtitle', { name: user?.name ?? '' })}
        >
            <Inventory />
        </Page>
    );
};

export default DashboardPage;
