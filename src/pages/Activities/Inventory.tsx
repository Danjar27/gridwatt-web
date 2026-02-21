import { ClipboardIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context.ts';
import { useInventoryActions } from './utils/context.ts';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';

import ViewTable from '@pages/Activities/tables/View.tsx';
import Create from '@pages/Activities/forms/Create.tsx';
import Update from '@pages/Activities/forms/Update.tsx';
import Delete from '@pages/Activities/forms/Delete.tsx';
import Summary from '@components/Summary/Summary.tsx';
import Button from '@components/Button/Button.tsx';

const Inventory = () => {
    const i18n = useTranslations();

    const { openCreate } = useInventoryActions();
    const { user } = useAuthContext();

    if (user?.role?.name === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button icon={PlusCircleIcon} onClick={openCreate}>
                        {i18n('pages.activities.action')}
                    </Button>
                </div>

                <Summary
                    icon={ClipboardIcon}
                    title={i18n('pages.activities.summary.title')}
                    subtitle={i18n('pages.activities.summary.subtitle')}
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
