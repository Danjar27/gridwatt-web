import { SealIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useInventoryActions } from './utils/context.ts';
import { useTranslations } from 'use-intl';

import ViewTable from '@pages/Seals/tables/View.tsx';
import Create from '@pages/Seals/forms/Create.tsx';
import Update from '@pages/Seals/forms/Update.tsx';
import Delete from '@pages/Seals/forms/Delete.tsx';
import Summary from '@components/Summary/Summary.tsx';
import Button from '@components/Button/Button.tsx';

const Inventory = () => {
    const i18n = useTranslations();
    const { openCreate } = useInventoryActions();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button icon={PlusCircleIcon} onClick={openCreate}>
                    {i18n('pages.seals.action')}
                </Button>
            </div>

            <Summary
                icon={SealIcon}
                title={i18n('pages.seals.summary.title')}
                subtitle={i18n('pages.seals.summary.subtitle')}
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
