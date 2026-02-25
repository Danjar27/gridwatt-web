import { UsersIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context.ts';
import { useUsersActions } from './utils/context';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';

import ViewTable from '@pages/Users/tables/View';
import Create from '@pages/Users/forms/Create';
import Update from '@pages/Users/forms/Update';
import Delete from '@pages/Users/forms/Delete';
import ResetPassword from '@pages/Users/forms/ResetPassword';
import ChangeRole from '@pages/Users/forms/ChangeRole';
import Summary from '@components/Summary/Summary';
import Button from '@components/Button/Button';

const Inventory = () => {
    const i18n = useTranslations();
    const { openCreate } = useUsersActions();
    const { user } = useAuthContext();

    const isAuthorized = user?.role?.name === 'admin' || user?.role?.name === 'manager';

    if (!isAuthorized && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button icon={PlusCircleIcon} onClick={openCreate}>
                    {i18n('pages.users.action')}
                </Button>
            </div>

            <Summary
                icon={UsersIcon}
                title={i18n('pages.users.summary.title')}
                subtitle={i18n('pages.users.summary.subtitle')}
            >
                <ViewTable />
            </Summary>

            <Create />
            <Update />
            <Delete />
            <ResetPassword />
            <ChangeRole />
        </div>
    );
};

export default Inventory;
