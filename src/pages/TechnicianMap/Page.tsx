import { useTranslations } from 'use-intl';

import Page from '@layouts/Page';
import Inventory from '@pages/TechnicianMap/Inventory';

const TechnicianMapPage = () => {
    const i18n = useTranslations();

    return (
        <Page
            id="technician-map"
            breadcrumbs={[{ label: i18n('pages.technicianMap.title'), href: '/map' }]}
            className="flex-1 min-h-0"
        >
            <Inventory />
        </Page>
    );
};

export default TechnicianMapPage;
