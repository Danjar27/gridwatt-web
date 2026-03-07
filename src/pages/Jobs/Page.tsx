import { useTranslations } from 'use-intl';

import Inventory from '@pages/Jobs/Inventory';
import Page from '@layouts/Page';

const JobsPage = () => {
    const i18n = useTranslations();

    return (
        <Page id="jobs" breadcrumbs={[{ label: i18n('pages.jobs.title'), href: '/jobs' }]}>
            <Inventory />
        </Page>
    );
};

export default JobsPage;
