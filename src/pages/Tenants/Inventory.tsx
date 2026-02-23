import { PlusCircleIcon, AddressBookIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context';
import { useInventoryActions } from './utils/context';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';

import Summary from '@components/Summary/Summary';
import Button from '@components/Button/Button';
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
            <div className="flex items-center justify-between">
                <Button icon={PlusCircleIcon} onClick={openCreate}>
                    {i18n('pages.tenants.action')}
                </Button>
            </div>

            <Summary
                icon={AddressBookIcon}
                title={i18n('pages.tenants.summary.title')}
                subtitle={i18n('pages.tenants.summary.subtitle')}
            >
                <ViewTable />
            </Summary>

            <Create />
            <Update />
            {/*<Delete />*/}
        </div>
    );
};

export default Inventory;
