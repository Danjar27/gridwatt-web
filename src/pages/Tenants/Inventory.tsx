import { PlusCircleIcon, AddressBookIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context';
import { useInventoryActions } from './utils/context';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';

import ToolbarButton from '@components/PageToolbar/ToolbarButton';
import PageToolbar from '@components/PageToolbar/PageToolbar';
import Delete from '@pages/Tenants/forms/Delete.tsx';
import Summary from '@components/Summary/Summary';
import ViewTable from './tables/View';
import Create from './forms/Create';
import Update from './forms/Update';

const Inventory = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();
    const { openCreate } = useInventoryActions();

    const isAuthorized = user?.role?.name === 'admin';

    if (!isAuthorized && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6">
            <PageToolbar>
                <ToolbarButton icon={PlusCircleIcon} variant="primary" onClick={openCreate}>
                    {i18n('pages.tenants.action')}
                </ToolbarButton>
            </PageToolbar>

            <Summary
                icon={AddressBookIcon}
                title={i18n('pages.tenants.summary.title')}
                subtitle={i18n('pages.tenants.summary.subtitle')}
            >
                <ViewTable />
            </Summary>

            <Create />
            <Update />
            <Delete />
        </div>
    );
};

export default Inventory;
