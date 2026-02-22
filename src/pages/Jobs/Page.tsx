import { useTranslations } from 'use-intl';

import Inventory from '@pages/Jobs/Inventory.tsx';
import Page from '@layouts/Page.tsx';

const JobsPage = () => {
    const i18n = useTranslations();

    return (
        <Page id="jobs" title={i18n('pages.jobs.title')} subtitle={i18n('pages.jobs.subtitle')}>
            <Inventory />
        </Page>
    );
};

export default JobsPage;
